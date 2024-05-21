const express = require("express");
const router = express.Router();
const Group = require("../models/group.model");
const customerModel = require("../models/customer.model");

router.post("/addGroup", async (req, res) => {
  const { name, items, password, description } = req.body;
  try {
    const result = await Group.create({
      name,
      items,
      password,
      description,
    });
    if (result) {
      res
        .status(200)
        .send({ result: true, message: "group Added Succesfully" });
    }
  } catch (err) {
    console.log("error in /addCustomer : " + err);
    res.status(500).send({ result: false, message: "internal server error" });
  }
});

router.get("/getGroup", async (req, res) => {
  try {
    // Fetch all groups from the database
    const groups = await Group.find().populate("items");

    res.status(200).send(groups); // Respond with the fetched groups
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ error: "An error occurred while fetching groups." });
  }
});

router.get("/getGroup/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const group = await Group.findById(id).populate("items").select("items");
    // console.log(group.items);
    res.status(200).send(group.items); // Respond with the fetched groups
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ error: "An error occurred while fetching groups." });
  }
});

router.post("/addGroupItem/:groupId", async (req, res) => {
  const { groupId } = req.params;
  const { contactName } = req.body;
  try {
    const customer = await customerModel.findOne({contactName: contactName})

      // console.log("customer", customer._id)
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).send({ success: false});
    }
    // Add the new item to the group's items array
    group.items.push(customer._id);
    const savedGroup = await group.save();
    if(savedGroup){
      return res.status(201).send({success : true});
    }
    return res.status(404).send({success : false});
  } catch (error) {
    console.error("Error adding item to group:", error);
    return res.status(500).send({ success : false});
  }
});

// Route to delete an item from a group
router.get("/deleteGroupItem/:groupId/:itemId", async (req, res) => {
  const { groupId, itemId } = req.params;
  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    // Remove the item from the group's items array
    group.items.pull(itemId);
    const savedGroup = await group.save();
    const groupmember = await savedGroup.populate('items')
    console.log(groupmember)
    res.status(200).json(groupmember);
  } catch (error) {
    console.error("Error deleting item from group:", error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the item." });
  }
});

router.get("/matchContactDetails/:Gid", async (req, res) => {
  const { param, field } = req.query; // Get parameter from query string
  const {Gid} = req.params 

  if (!field || !param) {
    res.status(200).send({ result: false, message: "Empty Input" });
  } else {
    let fieldName;
    switch (field) {
      case "contactName":
        fieldName = "contactName";
        break;
      case "phoneNumber":
        fieldName = "phoneNumber";
      default:
        return res
          .status(400)
          .json({ result: false, message: "Invalid " });
    }

    const query = { [fieldName]: param };
    console.log(Gid)

    try {
      const existingCustomer = await customerModel.findOne(query);
      
      if (!existingCustomer) {
        switch (field) {
          case "contactName":
            return res.json({ result: false, message: "Customer not exist", });
          case "phoneNumber":
            return res.json({ result: false, message: "PhoneNumber not exist", });
        }
      } else {
        switch (field) {
          case "contactName":
            const ListInfo = await Group.findOne({ _id : Gid})
            const doCustomerExist = ListInfo.items.includes(existingCustomer._id)
            if(!doCustomerExist){
              return res.json({ result: true, message: "Customer found", data: existingCustomer });
            }else{
              return res.json({ result: false, message: "Customer already exist in List" });
            }
          case "phoneNumber":
            return res.json({ result: true, message: "PhoneNumber found", });
        }

      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
});










module.exports = router;
