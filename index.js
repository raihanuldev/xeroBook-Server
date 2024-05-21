const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const { default: mongoose } = require("mongoose");
require("dotenv").config();
const serverless = require('serverless-http')
// let db = process.env.db_test;
// let db = "mongodb://localhost:27017/loveroom123"
let db = "mongodb://localhost:27017/xerobook123"
//const config = require("./config.js")

const cors = require("cors");
const cookieParser = require("cookie-parser");

const userRoute = require("./routes/user.route.js");
const customerRoute = require("./routes/customer.route.js");
const bankRoute = require("./routes/bank.route.js");
const groupRoute = require("./routes/group.route.js");

// Middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000", "https://xerobook.in"],
    credentials: true,
  })
);

// Routes
app.use("/api/users", userRoute);
app.use("/api/customer", customerRoute);
app.use("/api/bank", bankRoute);
app.use("/api/group", groupRoute);

// Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send("Something went wrong!");
// });

//check

app.get("/", (req, res) => {
  res.send("Hello World 123!");
});

// //for testing
mongoose
.connect(db)
.then(() => console.log("mongo db connected to Database"))
.catch((err) => console.log(err));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

// This handler function will be invoked by AWS Lambda
// module.exports.handler = async (event, context) => {
//   try {
//     // Connect to the database
//     //for production

//     // module.exports = {
//     //   db: process.env.MONGODB_URI || "mongodb://localhost:27017/myapp",
//     //   secretKey: "your-secret-key",
//     // };

//     //for development
//     mongoose
//       .connect(db)
//       .then(() => console.log("mongo db connected to Database"))
//       .catch((err) => console.log(err));


//     // Now, you can continue with your regular logic
//     return serverless(app)(event, context);
//   } catch (err) {
//     console.error('Error connecting to database:', err);
//     // Handle the error appropriately
//     return {
//       statusCode: 500,
//       body: JSON.stringify({
//         error: 'Internal Server Error'
//       })
//     };
//   }

// };