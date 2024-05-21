const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    contactName: {
      type: String,
      default: "",
      unique: true,
      required: true
    },
    contactType: {
      type: String,
      default: "",
      required: true, 
    },
    phoneNumber: {
      type: String,
      default: "",
      unique: true,
      required: true,
    },
    emailAddress: {
      type: String,
      default: ""
      // required: true,
    },

    // Optional Fields
    referenceID: {
      type: String,
      default: ""
    },

    additionalNotes: {
      type: String,
      default: ""
    },

    //payment details
    paymentDetails: {
      upiDetails: {
        type: String,
        default: "",
        unique: true
      },

      walletDetails: {
        walletType: {
          type: String,
          default: "",
        },

        walletPhoneNo: {
          type: String,
          default: "",
          unique: true
        },
      },

      bankDetails: {
        accountHolder: {
          type: String,
          default: "",
        },

        bankAic: {
          type: String,
          default: "",
          unique: true
        },

        ifsc: {
          type: String,
          default: "",
          required: true

        },
      },
    },
    customerBalance: {
      type: Number,
      default: 0,

    },
    openingBalance: {
      type: Number,
    },
    transactions: {
      trn: [
        {
          trn_id: { type: mongoose.Types.ObjectId, },
          datetime: { type: Date, },
          currentBalance : { type: Number},
          date: { type: String, },
          time: { type: String, },
          debit: { type: Number, },
          credit: { type: Number, },
          bonus: { type: Number, },
          bankBalance: { type: Number, },
          totalBankbalance: { type: Number, },
          bankname: { type: String, },
          doneBy: { type: String, },
          utr: { type: String, unique: true},
          totalCoin: { type: Number, },
          activeAction: { type: String, default: "" },
          finalized: { type: Boolean, default: false },
        }
      ],
      utr: [],
    },
    // transactions: {
    //   credit: [{datetime:"", bank:"bank1", deposit:"3500", bonus:"400"},{datetime:"", bank:"bank1", deposit:"3500", bonus:"400"},],
    //   debit: [{datetime:"", amount:"-5500"},{datetime:"", amount:"-500"},],
    // },
    salaryAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

customerSchema.statics.hasUTR = async function (UTR) {
  // Use collection methods to query all documents
  const customer = await this.findOne({ 'transactions.utr': UTR });
  return customer !== null;
};

customerSchema.statics.hasTRN = async function (TRN) {
  // Use collection methods to query all documents
  const customer = await this.findOne({ 'transactions.trn.trn_id': TRN });
  return customer !== null;
};

customerSchema.statics.findByPhone = async function (phoneNumber) {
  console.log(phoneNumber)
  const customer = await this.findOne({ 'phoneNumber': phoneNumber });
  if (!customer) {
    return null; // Handle case where customer is not found
  }
  return customer.contactName;
};

const customerModel = mongoose.model("Customers", customerSchema);

module.exports = customerModel;
