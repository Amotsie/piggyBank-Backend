require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = async () => {
  const connect = await mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: true,
    })
    .then(() => console.log("connected to MongoDB 😎"))
    .catch((err) => console.log(err.message));
};
module.exports = connectDB;
