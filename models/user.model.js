const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: "New User"
    // required: true,
  },
  businessName: {
    type: String,
    default: "My Business"
    // required: true,
  },
  email: {
    type: String,
    // required: true,
    // unique: true,
  },
  password: {
    type: String,
    // required: true,
  },
  phoneNumber: {
    type: String,
    unique: true,
  },
},
  {
    timestamps: true,
  }
);

const userModel = mongoose.model("Users", userSchema);

module.exports = userModel;
