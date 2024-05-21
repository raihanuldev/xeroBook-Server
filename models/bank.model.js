const mongoose = require("mongoose");

const bankSchema = new mongoose.Schema({
  bankname: {
    type: String,
    required: true,
    unique: true,
  },
  accountHolder: {
    type: String,
  },

  bankAic: {
    type: String,
    required: true,
    unique: true,
  },

  ifsc: {
    type: String,
  },
  panNo:{
    type: String,
    default: ""
    // unique: true,
  },
  balance:{
    type: Number,
    required: true,
    default: 0,
  },
  active: {
    type: String,
    default: "Yes",
    required: true,
  },
},
  {
    timestamps: true,
  }
);

bankSchema.statics.allBankBalance = async function () {
  const result = await this.aggregate([
    { $group: { _id: null, totalBalance: { $sum: "$balance" } } }
  ]);
  if (result) {
    const totalBalance = result.length > 0 ? result[0].totalBalance : 0;
    return totalBalance;

  }
};

const bankModel = mongoose.model("Banks", bankSchema);







module.exports = bankModel;