const express = require("express");
const router = express.Router();
const bankModel = require("../models/bank.model");

// Create bank
router.post("/addBank", async (req, res) => {
  try {
    const { formData } = req.body;

    const result = await bankModel.create({
      bankname: formData.bankname,
      accountHolder: formData.accountHolder,
      bankAic: formData.bankAic,
      ifsc: formData.ifsc,
      panNo: formData.panNo,
      balance: formData.balance,
    });
    if (result) {
      res.status(200).send({ result: true, message: "Bank Added Succesfully" });
    } else {
      res.status(500).send("internal server error: ");
    }
  } catch (error) {
    console.log("internal server error: " + error);
    res.status(500).send("internal server error: ");
  }
});

router.post("/updateBank", async (req, res) => {
  try {
    const { formData } = req.body;
    const { bankname, accountHolder, bankAic, ifsc, panNo, balance, active } = formData.step1; // Destructure active status from step1

    const filter = { bankname: bankname };
    const update = {
      accountHolder: accountHolder,
      bankAic: bankAic,
      ifsc: ifsc,
      panNo: panNo,
      active: active == "active" ? "Yes" : "No",
      balance: balance,
    };

    const updatedBank = await bankModel.findOneAndUpdate(
      filter, // Where clause: find by bankname
      update, // Update only the active field
      { new: true } // Return the updated document
    );

    if (updatedBank) {
      res
        .status(200)
        .send({ result: true, message: "Bank Status Updated Succesfully" });
    } else {
      res.status(404).send({ result: false, message: "Bank Not Found" });
    }
  } catch (error) {
    console.error("Internal server error: " + error);
    res.status(500).send("Internal server error: ");
  }
});

router.get("/getBankList", async (req, res) => {
  try {
    const result = await bankModel.find();
    if (result) {
      res.status(200).send(result);
    } else {
      res.status(500).send("internal server error: ");
    }
  } catch (err) {
    console.log("error in /getBank : " + err);
    res.status(500).send({ message: "internal server error" });
  }
});

router.get("/getActiveBanks", async (req, res) => {
  try {

    const projection = {
      _id: 0,
      bankname: 1,
    };

    const activeBanks = await bankModel.find(
      { active: "Yes" },
      projection
    ); // Filter for "Yes"

    if (activeBanks) {
      res.status(200).json(activeBanks);
    } else {
      res.status(200).json({ message: "No active banks found." }); // Informative message
    }
  } catch (err) {
    console.error("Error in /getActiveBanks:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/bankBalance/:bankName", async (req, res) => {
  const { bankName } = req.params;
  try {
    const result = await bankModel.aggregate([
      {
        $match: { bankname: bankName },
      },
      {
        $project: {
          _id: 0,
          balance: 1
        }
      }
    ])
    if (result && result.length > 0) {
      return res.status(200).send({ success: true, data: result[0] })
    }else{
      res.status(200).send({ success: true, data: {balance : 0} })
    }
  } catch (error) {
    console.log("error in /bankbalance", error)
    return res.status(500).send({ success: false })
  }

})

router.get("/matchBankDetails", async (req, res) => {
  const { param, field } = req.query; // Get parameter from query string

  if (!field || !param) {
    res.status(200).send({ result: false, message: "Empty Input" });
  } else {
    let fieldName;
    switch (field) {
      case "bankname":
        fieldName = "bankname";
        break;
      case "bankAic":
        fieldName = "bankAic";
        break;
      case "panNo":
        fieldName = "panNo";
        break;
      default:
        return res
          .status(400)
          .json({ result: false, message: "Invalid payment type" });
    }

    const query = { [fieldName]: param };

    try {
      const existingBankOption = await bankModel.findOne(query);

      // if (existingBankOption) {
      //   return res.json({ result: false, message: "Bank already exist" });
      // } else {
      //   return res.json({ result: true, message: "Bank Name Available" });
      // }
      if (existingBankOption) {
        switch (field) {
          case "bankname":
            return res.json({ result: false, message: "Bank already exist", data: existingBankOption });
          case "bankAic":
            return res.json({ result: false, message: "Bank A/C Number already exist", });
          case "panNo":
            return res.json({ result: false, message: "PAN Number already exist", });
        }
      } else {
        switch (field) {
          case "bankname":
            return res.json({ result: true, message: "Bank Available" });
          case "bankAic":
            return res.json({ result: true, message: "Bank A/C Number Available" });
          case "panNo":
            return res.json({ result: true, message: "PAN Number Available" });
        }
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
});

router.get("/matchBankAic", async (req, res) => {
  const { param } = req.query; // Get parameter from query string

  if (!param) {
    res.status(200).send({ result: false, message: "Empty Input" });
  } else {
    const query = { ["bankAic"]: param };

    try {
      const existingBankOption = await bankModel.findOne(query);

      if (existingBankOption) {
        return res.json({ result: false, message: "Bank Account already exist" });
      } else {
        return res.json({ result: true, message: "Bank Account Available" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
});

// router.get("/searchBanks", async (req, res) => {
//   const name = req.query.name; // Get name parameter from query string
//   if (name.length >= 1) {
//     try {
//       const regex = new RegExp(`^${name}`, "i"); // Case-insensitive search with regex
//       const banks = await bankModel
//         .find({ bankname: { $regex: regex } })
//         .limit(10); // Limit suggestions to 10
//       if (banks.length <= 1) {
//         res.status(204).send();
//       } else {
//         res.json(banks.map((bank) => bank.bankname));
//       }
//       //res.json(banks.map((bank) => bank.bankname)); // Send only contact names for autocomplete
//     } catch (error) {
//       console.error(error);
//       res.status(500).send("Internal Server Error");
//     }
//   } else {
//     res.status(200).send({ result: false, message: "Empty Input" });
//   }
// });

router.get("/searchBanks", async (req, res) => {
  const name = req.query.name; // Get name parameter from query string

  if (name && name.length >= 1) {
    try {
      const regex = new RegExp(`^${name}`, "i"); // Case-insensitive search with regex
      const banks = await bankModel
        .find({ bankname: { $regex: regex } })
        .limit(10); // Limit suggestions to 10
      if (banks.length === 0) {
        res.status(204).send(); // No content
      } else {
        const bankname = banks.map((bank) => bank.bankname);
        res.json(bankname);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res
      .status(400)
      .send({ result: false, message: "Empty Input or Invalid Input" });
  }
});

router.get("/totalBankbalance", async (req, res) => {
  try {
    const result = await bankModel.aggregate([
      { $group: { _id: null, totalBalance: { $sum: "$balance" } } }
    ]);

    if (result) {
      const totalBalance = result.length > 0 ? result[0].totalBalance : 0;
      console.log('totalBalance:', totalBalance);
      return res.status(200).send({ success: true, totalBalance });

    }
  } catch (err) {
    console.error('Error calculating total Balance:', err);
    return res.status(505).send({ success: false });
  }
})

module.exports = router;
