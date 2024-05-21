const express = require("express");
const router = express.Router();
var mongoose = require('mongoose');
const customerModel = require("../models/customer.model");
const bankModel = require("../models/bank.model");


router.post("/addCustomer", async (req, res) => {
  const { formData } = req.body;
  console.log(formData);
  try {
    const result = await customerModel.create({
      contactName: formData.step1.contactName,
      contactType: formData.step1.contactType,
      phoneNumber: formData.step1.phoneNumber,
      emailAddress: formData.step1.emailAddress,
      referenceID: formData.step1.referenceID,
      additionalNotes: formData.step1.additionalNotes,
      paymentDetails: {
        upiDetails: formData.step2.upiId,
        walletDetails: {
          walletType: formData.step2.walletType,
          walletPhoneNo: formData.step2.amzPhone,
        },
        bankDetails: {
          accountHolder: formData.step2.accountHolder,
          bankAic: formData.step2.bankAic,
          ifsc: formData.step2.ifsc,
        },
      },
      customerBalance: formData.step1.balanceOption === "gave" ? -formData.step1.customerBalance : formData.step1.customerBalance,
      salaryAmount: formData.step1.contactType === "Staff" ? formData.step2.salary : 0,
    });
    if (result) {
      res.status(200).send({ result: true, message: "User Added Succesfully" });
    }
  } catch (err) {
    console.log("error in /addCustomer : " + err);
    res.status(500).send({ result: false, message: "internal server error" });
  }
  //   res.send("ok");
});


router.patch('/updateCustomer/:id', async (req, res) => {
  const { id } = req.params;
  const { formData } = req.body;

  const contactName =  await customerModel.findOne({contactName: formData.contactName})
  if(contactName) return  res.status(400).send({result : false, message : "Contact Name already exists"});
  
  const phoneNumber =  await customerModel.findOne({phoneNumber: formData.phoneNumber})
  if(phoneNumber) return  res.status(400).send({result : false, message : "Phone Number already exists"});
  

  if(formData['paymentDetails.walletDetails.walletPhoneNo']){
    const walletPhoneNo =  await customerModel.findOne({'paymentDetails.walletDetails.walletPhoneNo': formData['paymentDetails.walletDetails.walletPhoneNo']})
    if(walletPhoneNo) return  res.status(400).send({result : false, message : "Wallet Phone Number already exists"});
  }

  if(formData['paymentDetails.bankDetails.bankAic']){
    const bankAic =  await customerModel.findOne({'paymentDetails.bankDetails.bankAic': formData['paymentDetails.bankDetails.bankAic']})
    if(bankAic) return  res.status(400).send({result : false, message : "Bank A/C Number already exists"});
  }

  if(formData['paymentDetails.upiDetails']){
    const upiDetails =  await customerModel.findOne({'paymentDetails.upiDetails': formData['paymentDetails.upiDetails']})
    if(upiDetails) return res.status(400).send({result : true, message : "UPI details already exists"});
  }


  try {
    const updatedItem = await customerModel.findOneAndUpdate(
      { _id: id },
      formData,
      { new: true } // Return the updated document
    );

    if (updatedItem) {
      return res.status(200).send({ success: true, message: "Customer Update Successful" })
    } else {
      return res.status(400).send({ success: false, message: "Please trya again" })
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({ success: false, message: "Internal Server error" })
  }
});

router.post('/addCustomerTable', async (req, res) => {
  const { formData } = req.body;
  console.log(formData);

  const contactName =  await customerModel.findOne({contactName: formData.contactName})
  if(contactName) return  res.status(400).send({result : false, message : "Contact Name already exists"});
  
  const phoneNumber =  await customerModel.findOne({phoneNumber: formData.phoneNumber})
  if(phoneNumber) return  res.status(400).send({result : false, message : "Phone Number already exists"});
  

  if(formData['paymentDetails.walletDetails.walletPhoneNo']){
    const walletPhoneNo =  await customerModel.findOne({'paymentDetails.walletDetails.walletPhoneNo': formData['paymentDetails.walletDetails.walletPhoneNo']})
    if(walletPhoneNo) return  res.status(400).send({result : false, message : "Wallet Phone Number already exists"});
  }

  if(formData['paymentDetails.bankDetails.bankAic']){
    const bankAic =  await customerModel.findOne({'paymentDetails.bankDetails.bankAic': formData['paymentDetails.bankDetails.bankAic']})
    if(bankAic) return  res.status(400).send({result : false, message : "Bank A/C Number already exists"});
  }

  if(formData['paymentDetails.upiDetails']){
    const upiDetails =  await customerModel.findOne({'paymentDetails.upiDetails': formData['paymentDetails.upiDetails']})
    if(upiDetails) return res.status(400).send({result : false, message : "UPI details already exists"});
  }



  try {
    const newCustomer = new customerModel({
      ...formData, openingBalance: formData.customerBalance
    }); // Create a new customer model instance

    const savedCustomer = await newCustomer.save(); // Save the new customer to database

    if (savedCustomer) {
      res.send({savedCustomer, result : true, message : "Customer Added Successfull"}); // Return the saved customer data
    } else {
      res.status(400).send({result : true, message : "Customer Added failed"}); // Handle unsuccessful save
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({result : true, message : "Internal Server Error"}); // Handle internal errors
  }
});


//add amount
router.post("/addAmount", async (req, res) => {
  try {
    const { formData } = req.body;
    if (formData.step1.contactName && formData.step1.amount) {
      // Find the customer by username
      // const customer = await customerModel.findOne ({ contactName: username });
      const customer = await customerModel.findOneAndUpdate(
        { contactName: formData.step1.contactName },
        { $inc: { customerBalance: parseFloat(formData.step1.amount) + parseFloat(formData.step1.bonus) } }, // Increment the customerBalance field
        { new: true } // Return the updated document
      );

      if (!customer) {
        return res
          .status(404)
          .json({ result: false, message: "Customer not found" });
      }

      // Get current date and time
      const currentDate = new Date();
      const dateTime = currentDate.toISOString();

      // Update the transactions credit array with datetime and amount
      customer.transactions.credit.push({
        datetime: dateTime,
        amount: parseFloat(formData.step1.amount),
        bonus: parseFloat(formData.step1.bonus),
        bankname: formData.step1.bankname,
        doneBy: formData.step1.doneBy,
      });

      customer.transactions.utr.push(
        formData.step1.utr
      )

      // Update the customer document in the database
      await customer.save();

      res.status(200).json({
        result: true,
        message: "Amount added successfully",
      });
    } else {
      res
        .status(400)
        .json({ result: false, message: "Username and amount are required" });
    }
  } catch (err) {
    console.log("Error in /addAmount:", err);
    res.status(500).json({ result: false, message: "Internal server error" });
  }
});

//withdraw amount
router.post("/transaction", async (req, res) => {
  function parseTimeString(timeString) {
    const timeParts = timeString.split(':');
    const hours = timeParts[0];
    const minutes = timeParts[1];
    const seconds = timeParts.length === 3 ? timeParts[2] : '00'; // Default to 00 if seconds not provided
    return new Date(`1970-01-01T${hours}:${minutes}:${seconds}Z`);
  }

  try {
    const { formData } = req.body;
    // console.log(formData)
    if (formData.contactName) {
      if (formData["transactions.trn.bankname"] && formData["transactions.trn.utr"] && formData["transactions.trn.totalCoin"]) {
        if (parseFloat(formData['transactions.trn.debit']) >= 0 && parseFloat(formData['transactions.trn.bonus']) >= 0 && parseFloat(formData['transactions.trn.credit']) >= 0) {
          const UTRExists = await customerModel.hasUTR(formData['transactions.trn.utr']);

          if (UTRExists) {
            return res
              .status(400)
              .json({ result: false, message: "UTR already Exists" });
          }
          else {
            const customer = await customerModel.findOneAndUpdate(
              { contactName: formData.contactName },
              { $inc: { customerBalance: -parseFloat(formData['transactions.trn.debit']) + parseFloat(formData['transactions.trn.bonus']) + parseFloat(formData['transactions.trn.credit']) } }, // Increment the customerBalance field
              { new: true } // Return the updated document
            );
            const bank = await bankModel.findOneAndUpdate(
              { bankname: formData["transactions.trn.bankname"] },
              { $inc: { balance: parseFloat(formData['transactions.trn.debit']) - parseFloat(formData['transactions.trn.bonus']) - parseFloat(formData['transactions.trn.credit']) } }, // Increment the customerBalance field
              { new: true } // Return the updated document
            )

            if (!customer) {
              return res
                .status(404)
                .json({ result: false, message: "Customer not found" });
            }
            if (!bank) {
              return res
                .status(404)
                .json({ result: false, message: "Bank not found" });
            }

            let currentDate = null;
            let currentTime = null;

            if (!formData['transactions.trn.date']) {
              console.log("no input");
              currentDate = new Date().toLocaleDateString('en-IN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                timeZone: 'Asia/Kolkata'
              });
            } else {

              const parsedDate = new Date(formData['transactions.trn.date']);
              console.log("pd:", parsedDate);
              // Convert the Date object to IST format with desired formatting
              currentDate = parsedDate.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                timeZone: 'Asia/Kolkata'
              });
            }


            if (!formData['transactions.trn.time']) {
              console.log("no input");
              currentTime = new Date().toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZone: 'Asia/Kolkata'
              });
            } else {


              const timeObject = parseTimeString(formData['transactions.trn.time']);
              const desiredReduction = { hours: 5, minutes: 30 };
              timeObject.setHours(timeObject.getHours() - desiredReduction.hours);
              timeObject.setMinutes(timeObject.getMinutes() - desiredReduction.minutes);
              const meridian = timeObject.getHours() < 12 ? 'AM' : 'PM';
              const hours12 = timeObject.getHours() % 12 || 12; // Adjust for 12 PM
              const minutes = timeObject.getMinutes();
              const seconds = timeObject.getSeconds();
              currentTime = `${hours12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${meridian}`;
            }

            console.log(currentDate, currentTime)

            // Get today's date and current time
            const today = new Date();
            const todayDate = today.toISOString().slice(0, 10); // Extract YYYY-MM-DD
            const Time = today.toISOString().slice(11, 16); // Extract HH:mm
            const timeObject = parseTimeString(Time);
            const hours = timeObject.getHours()
            const minutes = timeObject.getMinutes();

            // Use formData values if available, otherwise use today's date and current time
            const combinedDate = formData['transactions.trn.date'] || todayDate;
            const combinedTime = formData['transactions.trn.time'] || `${hours}:${minutes}`;

            const dateTimeString = `${combinedDate} ${combinedTime}`;

            const date = new Date(Date.parse(dateTimeString)).toISOString()
            const dateTime = new Date().toISOString();

            console.log(date, ":", dateTime)

            const amt = parseFloat(formData['transactions.trn.debit']) - parseFloat(formData['transactions.trn.bonus']) - parseFloat(formData['transactions.trn.credit'])

            // Update the transactions credit array with datetime and amount
            customer.transactions.trn.push({
              trn_id: new mongoose.Types.ObjectId(),
              datetime: date,
              date: currentDate,
              time: currentTime,
              currentBalance: customer.customerBalance,
              debit: -parseFloat(formData['transactions.trn.debit']),
              credit: parseFloat(formData['transactions.trn.credit']),
              bonus: parseFloat(formData['transactions.trn.bonus']),
              bankname: formData['transactions.trn.bankname'],
              doneBy: formData['transactions.trn.doneBy'],
              utr: formData['transactions.trn.utr'],
              activeAction: "",
              finalized: false,
              bankBalance: parseFloat(bank.balance),
              totalBankbalance: parseFloat(formData['transactions.trn.totalBankbalance']) + parseFloat(amt),
              totalCoin: parseFloat(formData['transactions.trn.totalCoin']),

            });

            customer.transactions.utr.push(
              formData['transactions.trn.utr']
            )

            // Update the customer document in the database
            await customer.save();
            await bank.save();

            const newlyAddedTransaction = customer.transactions.trn[customer.transactions.trn.length - 1];

            // Project only specific fields before sending the response
            const projectedCustomer = {
              _id: customer._id,
              contactName: customer.contactName,
              transactions: {
                trn: newlyAddedTransaction
              },
            };

            return res.status(200).json({
              result: true,
              message: "Trsansaction added successfully",
              data: projectedCustomer,
            });
          }
        }
        return res
          .status(400)
          .json({ result: false, message: "Amount should be positive" });

      }
      else {
        return res
          .status(400)
          .json({ result: false, message: "All feild are mandatory" });

      }
      // if( customerExists = await Customer.hasUTR('your-utr-value');)
      // const customer = await customerModel.findOne({contactName: formData.contactName})

    } else {
      res
        .status(400)
        .json({ result: false, message: "Username is required" });
    }
  } catch (err) {
    console.log("Error in /transaction:", err);
    res.status(500).json({ result: false, message: "Internal server error" });
  }
});


//get user credit detials
router.get("/getUserCreditDetails", async (req, res) => {
  try {
    // Leverage aggregation framework for efficient filtering
    const customersWithCredits = await customerModel.aggregate([
      {
        $match: { "transactions.credit": { $exists: true } } // Find documents with non-empty "debit" array
      },
      {
        $unwind: "$transactions.credit" // Deconstruct each "debit" element into separate documents
      },
      {
        $project: {
          _id: 1, // include _id for privacy or as needed
          contactName: 1, // Include contactName for identification
          creditTransactions: "$transactions.credit", // Project only the "credit" array (optional)
          activeAction: 1
        }
      }
    ]);

    // Format dates after aggregation
    const formattedCustomers = customersWithCredits.map(customer => {
      // Assuming there's a date field within "debitTransaction" (replace with actual field name)
      const creditDate = customer.creditTransactions.datetime; // Access the date field

      if (creditDate) {
        const formattedDate = new Date(creditDate).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });

        customer.creditTransactions.date = formattedDate; // Replace with actual field name for date
        // Extract and format time
        const time = new Date(creditDate).toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        customer.creditTransactions.time = time;
      }
      return customer;
    });

    res.status(200).send(formattedCustomers);
    // res.status(200).json({ result: true, message: "Customers with debit transactions found.", data: customersWithDebits });
  } catch (err) {
    console.error("Error in /getUserCreditDetails:", err.message);
    res.status(500).json({ result: false, message: "Internal server error" });
  }
});

//get user debit detials
router.get("/getUserDebitDetails", async (req, res) => {
  try {
    // Leverage aggregation framework for efficient filtering
    const customersWithDebits = await customerModel.aggregate([
      {
        $project: {
          _id: 1, // Include _id for privacy or as needed
          contactName: 1, // Include contactName for identification
          transactions: {
            trn: {
              $filter: {
                input: "$transactions.trn",
                as: "transaction",
                cond: { $eq: ["$$transaction.finalized", false] }
              }
            }
          }
        }
      },
      {
        $unwind: "$transactions.trn" // Deconstruct each "debit" element into separate documents
      },
      {
        $sort: { "transactions.trn.datetime": -1 } // Sort by "datetime" in descending order (newest first)
      }
    ]);



    // Format dates after aggregation
    const formattedCustomers = customersWithDebits.map(customer => {
      // Assuming there's a date field within "debitTransaction" (replace with actual field name)
      const debitDate = customer.transactions.trn.datetime; // Access the date field

      if (debitDate) {
        const formattedDate = new Date(debitDate).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });

        customer.transactions.trn.date = formattedDate; // Replace with actual field name for date
        // Extract and format time
        const time = new Date(debitDate).toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        customer.transactions.trn.time = time;
      }
      // console.log(customer)
      return customer;
    });
    // console.log(formattedCustomers[0].transactions.trn.trn_id)

    res.status(200).send(formattedCustomers);
    // res.status(200).json({ result: true, message: "Customers with debit transactions found.", data: customersWithDebits });
  } catch (err) {
    console.error("Error in /getUserDebitDetails:", err.message);
    res.status(500).json({ result: false, message: "Internal server error" });
  }
});



router.get("/getDaybookReport", async (req, res) => {
  try {
    // Leverage aggregation framework for efficient filtering


    const customersWithDebits = await customerModel.aggregate([
      {
        $project: {
          _id: 1, // Include _id for privacy or as needed
          contactName: 1, // Include contactName for identification
          transactions: {
            trn: {
              $filter: {
                input: "$transactions.trn",
                as: "transaction",
                cond: { $eq: ["$$transaction.finalized", true] }
              }
            }
          }
        }
      },
      {
        $unwind: "$transactions.trn" // Deconstruct each "debit" element into separate documents
      },
      {
        $sort: { "transactions.trn.datetime": -1 } // Sort by "datetime" in descending order (newest first)
      }
    ]);


    // console.log(customersWithDebits[0].transactions.trn);

    // Format dates after aggregation
    const formattedCustomers = customersWithDebits.map(customer => {
      // Assuming there's a date field within "debitTransaction" (replace with actual field name)
      const debitDate = customer.transactions.trn.datetime; // Access the date field

      if (debitDate) {
        const formattedDate = new Date(debitDate).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });

        customer.transactions.trn.date = formattedDate; // Replace with actual field name for date
        // Extract and format time
        const time = new Date(debitDate).toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        customer.transactions.trn.time = time;
      }
      return customer;
    });

    res.status(200).send(formattedCustomers);
    // res.status(200).json({ result: true, message: "Customers with debit transactions found.", data: customersWithDebits });
  } catch (err) {
    console.error("Error in /getUserDebitDetails:", err.message);
    res.status(500).json({ result: false, message: "Internal server error" });
  }
});

// router.patch("/updateTransaction", async (req, res) => {
//   const formdata = req.body
//   console.log("FORMDATA:", formdata);

//   const { _id, ...data } = formdata.formData

//   const temp = await customerModel.findOne(
//     { 'transactions.trn.trn_id': _id }, // Match the document containing the trn_id
//   );

//   // Find the transaction within the customer's transactions
//   // let transactionToUpdate = null;
//   // for (const transaction of temp.transactions.trn) {
//   //   if (transaction.trn_id.equals(_id)) {
//   //     transactionToUpdate = transaction;
//   //     break;
//   //   }
//   // }

//   const updateObj = {};
//   let amount = 0;
//   for (const key in data) {
//     if (data.hasOwnProperty(key)) {
//       const fieldName = key.split('.').pop();
//       if (fieldName === "debit") {
//         console.log("debit")
//         updateObj[`transactions.trn.$[elem].${fieldName}`] = -parseFloat(data[key]);
//         amount -= parseFloat(data[key])
//       }
//       if (fieldName === "credit") {
//         console.log("credit")
//         updateObj[`transactions.trn.$[elem].${fieldName}`] = parseFloat(data[key]);
//         amount += parseFloat(data[key])
//       }
//       if (fieldName === "bonus") {
//         console.log("bonus")
//         updateObj[`transactions.trn.$[elem].${fieldName}`] = parseFloat(data[key]);
//         amount += parseFloat(data[key])

//       }
//       if (fieldName !== "bonus" && fieldName !== "credit" && fieldName !== "debit") {
//         updateObj[`transactions.trn.$[elem].${fieldName}`] = data[key];
//       }
//     }
//   }

//   console.log(updateObj);


//   console.log(amount)
//   try {
//     // const customer = await customerModel.findOneAndUpdate(
//     //   { 'transactions.trn.trn_id': _id },
//     //   { $inc: { customerBalance: amount } }, // Increment the customerBalance field
//     //   { new: true } // Return the updated document
//     // );

//     const result = await customerModel.updateOne(
//       { 'transactions.trn.trn_id': _id }, // Match the document containing the trn_id
//       { $set: updateObj },
//       { arrayFilters: [{ 'elem.trn_id': _id }], new: true } // Filter the array elements where trn_id matches
//     );
//     console.log('Update result:', result);
//     // console.log('customer result:', customer);

//     // if (!customer || !result) {
//     if (!result) {
//       return res.send({ success: false })
//     }

//     return res.send({ success: true });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Internal Server Error");
//   }

// })

router.patch("/updateTransaction", async (req, res) => {
  const formdata = req.body
  console.log("FORMDATA:", formdata);

  const { _id, ...data } = formdata.formData

  const temp = await customerModel.findOne(
    { 'transactions.trn.trn_id': _id }, // Match the document containing the trn_id
  );
  if (data.contactName) {

    if (data.contactName != temp.contactName) {
      console.log("failed")
      return res.send({ success: false, message: "Contact Name cannot be updated" })
    }
  }

  if (data['transactions.trn.utr'] != undefined) {
    const hasUTR = await customerModel.hasUTR(data['transactions.trn.utr'])
    if (hasUTR) {
      return res.send({ success: false, message: "UTR already exist" })
    }
    const removeCurrUTR = await customerModel.findByIdAndUpdate(
      temp._id,
      { $pull: { 'transactions.utr': data['transactions.trn.utr'] } },
      { new: true })
  }


  // Find the transaction within the customer's transactions
  let transactionToUpdate = null;
  for (const transaction of temp.transactions.trn) {
    if (transaction.trn_id.equals(_id)) {
      transactionToUpdate = transaction;
      break;
    }
  }

  const updateObj = {};
  let amount = 0;
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const fieldName = key.split('.').pop();
      if (fieldName === "debit") {
        updateObj[`transactions.trn.$[elem].${fieldName}`] = -parseFloat(Math.abs(data[key]));
        amount -= parseFloat(Math.abs(data[key]));
      } 
      else {
        amount -= Math.abs(transactionToUpdate.debit)
      }
      if (fieldName === "credit") {
        updateObj[`transactions.trn.$[elem].${fieldName}`] = parseFloat(data[key]);
        amount += parseFloat(Math.abs(data[key]))
      } 
      else {
        amount += Math.abs(transactionToUpdate.credit)
      }
      if (fieldName === "bonus") {
        updateObj[`transactions.trn.$[elem].${fieldName}`] = parseFloat(data[key]);
        amount += parseFloat(Math.abs(data[key]))
      } 
      else {
        amount += Math.abs(transactionToUpdate.bonus)
      }
      if (fieldName !== "bonus" && fieldName !== "credit" && fieldName !== "debit") {
        updateObj[`transactions.trn.$[elem].${fieldName}`] = data[key];
      }
    }
  }


  let oldAmount = transactionToUpdate.debit + transactionToUpdate.credit + transactionToUpdate.bonus
  const difference = parseFloat(oldAmount - amount)

  let currentBank = data.bankname;
  let prevBank = transactionToUpdate.bankname

  console.log("bank", prevBank, currentBank);
  console.log("amount, oldamt, diff", amount, oldAmount, difference);

  // if bank is to be updated
  if (currentBank) {
    // add deductded amount to prev bank
    // de the previous amount which was deducted from bank -- oldAmount 
    const updatePrevBank = await bankModel.findOneAndUpdate(
      { bankname: prevBank },
      { $inc: { balance: oldAmount } }, // Increment the customerBalance field
      { new: true } // Return the updated document
    );
    if (!updatePrevBank) {
      return res.send({ success: false, message: "Account Balance update failed" })
    }
    // add the new Transaction directly to new bank amount
    // updated transaction will be directly substracted
    const updateCurrBank = await bankModel.findOneAndUpdate(
      { bankname: currentBank },
      { $dec: { balance: amount } }, // Increment the customerBalance field
      { new: true } // Return the updated document
    );
    if (!updateCurrBank) {
      return res.send({ success: false, message: "Account Balance update failed" })
    }
    currentBankBalance = updateCurrBank.balance;

  } else {
    // if bank name is not change only change the the difference
    const bankUpdate = await bankModel.findOneAndUpdate(
      { bankname: prevBank },
      { $inc: { balance: -parseFloat(difference) } }, // Increment the customerBalance field
      { new: true } // Return the updated document
    );

    if (!bankUpdate) {
      return res.send({ success: false, message: "Account Balance update failed" })
    }
    currentBankBalance = bankUpdate.balance;
  }

  const allBankBalance = await bankModel.allBankBalance();


  try {
    const customer = await customerModel.findOneAndUpdate(
      { 'transactions.trn.trn_id': _id },
      { $inc: { customerBalance: difference } }, // Increment the customerBalance field
      { new: true } // Return the updated document
    );

    if (!customer) {
      return res.send({ success: false, message: "Account Balance update failed" })
    }

    const result = await customerModel.updateOne(
      { 'transactions.trn.trn_id': _id }, // Match the document containing the trn_id
      { $set: { ...updateObj, 'transactions.trn.$[elem].bankBalance': currentBankBalance, 'transactions.trn.$[elem].totalBankbalance': allBankBalance , } },
      { arrayFilters: [{ 'elem.trn_id': _id }], new: true } // Filter the array elements where trn_id matches
    );
    console.log('Update result:', result);
    // console.log('customer result:', customer);
    // if (!customer || !result) {
    if (!result) {
      return res.send({ success: false, message: "Transaction update failed" })
    }
    return res.send({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Please try again!" });
  }
})

router.patch('/update-active-action/:id', async (req, res) => {
  const { id } = req.params;
  const { trn_id, activeAction } = req.body.formData;
  // console.log(activeAction)
  try {
    const customer = await customerModel.findById(id);

    if (!customer) {
      return res.status(404).send("Customer not found");
    }

    // Find the transaction within the customer's transactions
    let transactionToUpdate = null;
    for (const transaction of customer.transactions.trn) {
      if (transaction.trn_id.equals(trn_id)) {
        transactionToUpdate = transaction;
        break;
      }
    }

    if (!transactionToUpdate) {
      return res.status(404).send("Transaction not found");
    }

    // Update the transaction's activeAction
    transactionToUpdate.activeAction = activeAction;
    // transactionToUpdate.finalized = transactionToUpdate.finalized

    // Save the updated customer document (ensures changes are saved)
    customer.markModified('transactions');
    await customer.save();

    // Project only specific fields before sending the response
    // console.log(transactionToUpdate)
    const projectedCustomer = {
      _id: customer._id,
      contactName: customer.contactName,
      transactions: {
        trn: transactionToUpdate
      },
    };

    // Optional date formatting (if applicable)
    if (transactionToUpdate && transactionToUpdate.datetime) {
      const formattedDate = new Date(transactionToUpdate.datetime)
        .toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
      transactionToUpdate.date = formattedDate; // Optional: Add formatted date
      const time = new Date(transactionToUpdate.datetime)
        .toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
      transactionToUpdate.time = time; // Optional: Add formatted time
    }

    // Send the updated customer document
    // console.log("projected customer length", projectedCustomer.length)
    // res.json(projectedCustomer);
    res.send({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});



router.post("/addMultipleCustomers", async (req, res) => {
  const { formData } = req.body;
  try {
    // console.log("excel data", formData);
    let result;
    for (let i = 0; i < formData.length; i++) {
      result = await customerModel.create({
        contactName: formData[i].PartyName,
        contactType: formData[i].AccountType,
        phoneNumber: formData[i].PhoneNumber,
        // emailAddress: formData[i].step1.emailAddress,
        // referenceID: formData[i].step1.referenceID,
        // additionalNotes: formData[i].step1.additionalNotes,
        paymentDetails: {
          upiDetails: formData[i].upiID,
          walletDetails: {
            walletType: formData[i].WalletType,
            walletPhoneNo: formData[i].WalletPhoneNumber,
          },
          bankDetails: {
            accountHolder: formData[i].BankAccountName,
            bankAic: formData[i].AccountNumber,
            ifsc: formData[i].ifscCode,
          },
        },
        customerBalance: formData[i].OpeningBalance ? formData[i].GaveGot === "gave" ? -formData[i].OpeningBalance : formData[i].OpeningBalance : 0,
        salaryAmount: formData[i].Salary ? formData[i].Salary : 0,
      });
    }
    console.log(result);
    res.status(200).send({ result: true, message: "ok" });
  } catch (err) {
    console.log("error in /addCustomer : " + err);
    return res.status(500).send({ result: false, message: "server error or duplicate entries found and Non dupplicate entried inserted" });
  }
  //   res.send("ok");
});

router.get("/getCustomers", async (req, res) => {
  try {
    const result = await customerModel.find().sort({ createdAt: -1 });;
    res.status(200).send(result);
  } catch (err) {
    console.log("error in /getCustomers : " + err);
    res.status(500).send({ message: "internal server error" });
  }
});

router.get("/getVendorList", async (req, res) => {
  try {
    const result = await customerModel.find({ contactType: "Vendor" });
    res.status(200).send(result);
  } catch (err) {
    console.log("error in /getVendorList : " + err);
    res.status(500).send({ message: "internal server error" });
  }
});

router.get("/getStaffList", async (req, res) => {
  try {
    const result = await customerModel.find({ contactType: "Staff" });
    res.status(200).send(result);
  } catch (err) {
    console.log("error in /getVendorList : " + err);
    res.status(500).send({ message: "internal server error" });
  }
});

router.get("/getClientList", async (req, res) => {
  try {
    const result = await customerModel.find({ contactType: "Client" });
    // console.log(result);
    res.status(200).send(result);
  } catch (err) {
    console.log("error in /getVendorList : " + err);
    res.status(500).send({ message: "internal server error" });
  }
});

router.get("/searchCustomers", async (req, res) => {
  const name = req.query.name; // Get name parameter from query string
  try {
    const regex = new RegExp(`^${name}`, "i"); // Case-insensitive search with regex
    const customers = await customerModel
      .find({ contactName: { $regex: regex } })
      .limit(10); // Limit suggestions to 10
    if (customers.length <= 1) {
      res.status(204).send();
    } else {
      res.json(customers.map((customer) => customer.contactName));
    }
    //res.json(customers.map((customer) => customer.contactName)); // Send only contact names for autocomplete
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/matchPaymentDetails", async (req, res) => {
  const { type, param } = req.query; // Get parameter from query string

  if (!type || !param) {
    return res
      .status(400)
      .json({ message: "Missing required parameters: type and param" });
  }

  let paymentType;
  switch (type) {
    case "1":
      paymentType = "paymentDetails.upiDetails";
      break;
    case "2":
      paymentType = "paymentDetails.walletDetails.walletPhoneNo"; // Search by phone number
      break;
    case "3":
      paymentType = "paymentDetails.bankDetails.bankAic"; // Search by IFSC code
      break;
    default:
      return res
        .status(400)
        .json({ result: false, message: "Invalid payment type" });
  }

  const query = { [paymentType]: param };

  try {
    const existingPaymentOption = await customerModel.findOne(query);

    if (existingPaymentOption) {
      switch (type) {
        case "1":
          return res.json({ result: false, message: "UPI ID already exist" });
        case "2":
          return res.json({
            result: false,
            message: "Wallet Number already exist",
          });
        case "3":
          return res.json({
            result: false,
            message: "Bank A/C Number already exist",
          });
      }
    } else {
      switch (type) {
        case "1":
          return res.json({ result: true, message: "UPI ID Available" });
        case "2":
          return res.json({ result: true, message: "Wallet Number Available" });
        case "3":
          return res.json({
            result: true,
            message: "Bank A/C Number Available",
          });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

//to check this is users exist or not
router.get("/matchExistingCustomers", async (req, res) => {
  const { param } = req.query; // Get parameter from query string
  if (!param) {
    res.status(200).send({ result: false, message: "Empty Input" });
  } else {
    const query = { ["contactName"]: param };
    try {
      const existingCustomerOption = await customerModel.findOne(query);

      if (existingCustomerOption) {
        return res.json({
          result: true,
          message: "Customer name exists",
          data: existingCustomerOption,
        });
      } else {
        return res.json({
          result: false,
          message: "Customer Does Not Exist Kindly Add",
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
})

router.get("/matchExistingStaff", async (req, res) => {
  const { param } = req.query; // Get parameter from query string
  if (!param) {
    res.status(200).send({ result: false, message: "Empty Input" });
  } else {
    try {
      const existingCustomerOption = await customerModel.findOne({
        contactName: param, // Use param directly for contact name
        contactType: "Staff" // Filter for staff members
      });

      if (existingCustomerOption) {
        return res.json({
          result: true,
          message: "Staff exists",
          data: existingCustomerOption,
        });
      } else {
        return res.json({
          result: false,
          message: "Staff Does Not Exist Kindly Add",
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
})

router.get("/matchExistingUTR", async (req, res) => {
  const { param } = req.query; // Get parameter from query string
  if (!param) {
    res.status(200).send({ result: false, message: "Empty Input" });
  } else {
    try {
      //const existingCustomerOption = await customerModel.findOne(query);
      const existingUTR = await customerModel.hasUTR(param);
      console.log(existingUTR)
      if (existingUTR) {
        return res.json({
          result: false,
          message: "UTR Already exists",
          data: existingUTR,
        });
      } else {
        return res.json({
          result: true,
          message: "UTR Available for Entry",
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
})

//find customers similar to bank route
router.get("/findcustomer", async (req, res) => {
  const name = req.query.name; // Get name parameter from query string

  if (name && name.length >= 1) {
    try {
      const regex = new RegExp(`^${name}`, "i"); // Case-insensitive search with regex
      const customers = await customerModel
        .find({ contactName: { $regex: regex } })
        .limit(10); // Limit suggestions to 10
      if (customers.length === 0) {
        res.status(204).send(); // No content
      } else {
        const contactNames = customers.map((customer) => customer.contactName);
        res.json(contactNames);
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

//find customers similar to bank route
router.get("/findstaff", async (req, res) => {
  const name = req.query.name; // Get name parameter from query string

  if (name && name.length >= 1) {
    try {
      const regex = new RegExp(`^${name}`, "i"); // Case-insensitive search with regex
      const customers = await customerModel
        .find({ contactName: { $regex: regex }, contactType: "Staff" })
        .limit(10); // Limit suggestions to 10
      if (customers.length === 0) {
        res.status(204).send(); // No content
      } else {
        const contactNames = customers.map((customer) => customer.contactName);
        res.json(contactNames);
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

// Route to get customers with balance less than 0
router.get("/negative-balance", async (req, res) => {
  try {
    const projection = {
      _id: 0,
      contactName: 1,
      phoneNumber: 1,
      contactType: 1,
      customerBalance: 1,
    };

    const negativeBalanceCustomers = await customerModel.find(
      { customerBalance: { $lt: 0 } },
      projection
    ); // Find with balance less than 0

    res.json(negativeBalanceCustomers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ message: "Error fetching customers" });
  }
});

// Route to get customers with balance greater than 0
router.get("/positive-balance", async (req, res) => {
  try {
    const projection = {
      _id: 0,
      contactName: 1,
      phoneNumber: 1,
      contactType: 1,
      customerBalance: 1,
    };

    const positiveBalanceCustomers = await customerModel.find(
      { customerBalance: { $gt: 0 } },
      projection
    ); // Find with balance greater than 0
    res.json(positiveBalanceCustomers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ message: "Error fetching customers" });
  }
});

//temporary delete users route made for to dele customers with invaid transactions
router.delete("/deleteCustomer/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await customerModel.findOneAndDelete({
      _id: id,
    });
    if (result)
      res.status(200).json({
        message: "users deleted successfully",
        result: result,
        data: result,
      });
    else {
      res.status(200).json({
        result: result,
        message: "user not found",
        data: result,
      });
    }
  } catch (err) {
    console.log("error in /deleteCustomer : " + err);
    res.status(500).json({ result: false, message: "internal server error" });
  }
});


router.post("/finalizeTransacton", async (req, res) => {
  const customerToFinalise = req.body;
  // console.log(customerToFinalise.slice(0, 4).map(cust => cust.transactions))
  try {
    const customerIds = customerToFinalise.map(customer => customer._id);
    const transactionIds = customerToFinalise.map(customer => customer.transactions.trn.trn_id);
    const data = await customerModel.updateMany(
      {
        _id: { $in: customerIds },
        'transactions.trn.trn_id': { $in: transactionIds },
        'transactions.trn.finalized': false
      },
      // { $set : {'transactions.trn.$.finalized': true}  },
      {
        $set: { 'transactions.trn.$[trn].finalized': true }
      },
      {
        arrayFilters: [
          { 'trn.trn_id': { $in: transactionIds }, 'trn.finalized': false }
        ]
      }

    )

    if (data.modifiedCount > 0) {
      return res.status(200).send({ success: true, message: "Finalised Successfull" })
    } else {
      return res.status(404).send({ success: false, message: "Finalised Failed" })
    }

  } catch (err) {
    console.log(err)
    return res.status(500).send({ success: false, message: "Internal Server error" })
  }

})

router.get("/getCustomersTransactions/:id", async (req, res) => {
  const { id } = req.params
  try {
    const data = await customerModel.findOne({ _id: id }).sort({ "transactions.trn.datetime": -1 });
    // console.log(data)
    if (data) {
      return res.status(200).send({ success: true, data: data, message: "Transactions Found" })
    } else {
      return res.status(404).send({ success: false, data: [], message: "No transaction Found" })
    }
  } catch (error) {
    console.log(error)
    return res.status(500).send({ success: false, data: [], message: "Internal Server Error" })
  }

})

router.get("/allIncomeSummary", async (req, res) => {
  try {
    const result = await customerModel.aggregate([
      { $unwind: '$transactions.trn' },
      { $group: { _id: null, totalDebit: { $sum: '$transactions.trn.debit' }, totalCredit: { $sum: '$transactions.trn.credit' }, totalBonus: { $sum: '$transactions.trn.bonus' } } }
    ]);

    if (result) {
      const totalExpense = result.length > 0 ? result[0].totalDebit : 0;
      const totalIncome = result.length > 0 ? result[0].totalCredit + result[0].totalBonus : 0;
      console.log('Total expense:', totalExpense);
      console.log('Total income:', totalIncome);
      return res.status(200).send({ success: true, totalExpense, totalIncome });

    }
  } catch (err) {
    console.error('Error calculating total debit:', err);
    return res.status(505).send({ success: false });
  }
})


module.exports = router;
