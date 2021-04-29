require("dotenv").config();
const mongoose = require("mongoose");
const Joi = require("joi");
const cors = require("cors");
const morgan = require("morgan");
const express = require("express");
const usersRouter = require("./routes/users");
const transactionsRouter = require("./routes/transactions");
const auth = require("./routes/auth");
const app = express();

mongoose
  .connect("mongodb://localhost/smartPiggy")
  .then(() => console.log("connected to MongoDB 😎"))
  .catch((err) => console.error("Could not connect to MongoDb..."));

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));

app.use("/api/users", usersRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/auth", auth);

app.get("/", (req, res) => {
  res.send("<h1>Welcome To The BACKend</h1>");
});

//OPEN Vault
app.get("/api/vault", (req, res) => {});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on Port ${PORT}`));
