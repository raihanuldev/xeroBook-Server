const { default: mongoose } = require("mongoose");
require("dotenv").config();
let db = process.env.db_test;

//for production

// module.exports = {
//   db: process.env.MONGODB_URI || "mongodb://localhost:27017/myapp",
//   secretKey: "your-secret-key",
// };

//for development
mongoose
  .connect(db)
  .then(() => console.log("mongo db connected to Database"))
  .catch((err) => console.log(err));
