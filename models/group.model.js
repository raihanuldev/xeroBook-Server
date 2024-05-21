const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  items: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customers", // Reference to the Customer model
      required: true,
    },
  ],
  description: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
