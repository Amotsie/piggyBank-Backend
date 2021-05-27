const express = require("express");
const admin = require("../middleware/admin");
const auth = require("../middleware/auth");
const router = express.Router();
const { Transaction, validate } = require("../models/transaction");

//get all transactions
router.get("/", [auth], async (req, res) => {
  try {
    const transactions = await Transaction.find().lean();
    if (transactions.length > 0) {
      res.send(transactions);
    } else throw new Error("There are no transactions available.");
  } catch (error) {
    res.send(error.message);
  }
});

//Get transactions of mentioned user
router.get("/:userId", [auth], async (req, res) => {
  let userId = req.params.userId;
  try {
    const transaction = await Transaction.find({ userId }).select("-__v");
    res.send(transaction);
  } catch (error) {
    return res
      .status(404)
      .send("The Transaction with the given ID was not found.");
  }
});

//create transaction [set headers(secretKey) from piggy and detect it here]
router.post("/:user", async (req, res) => {
  let user = req.params.user;
  const { error } = validate({ ...req.body, userId: user });
  if (error) return res.status(400).send(error.details[0].message);

  try {
    let transaction = new Transaction({
      userId: user,
      amount: req.body.amount,
      failedCoins: req.body.failedCoins,
      coins: req.body.coins,
    });
    transaction = await transaction.save();
    res.send(transaction);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

//Delete One trasaction using ID
router.delete("/:id", [auth, admin], async (req, res) => {
  let id = req.params.id;
  try {
    const transaction = await Transaction.findByIdAndRemove(id);
    res.send(transaction);
  } catch (error) {
    return res
      .status(404)
      .send("The transaction with the given ID was not found.");
  }
});

//ADMIN delete all transactions when opening vault [ADMIN]
router.delete("/", [auth, admin], async (req, res) => {
  try {
    let result = await Transaction.collection.drop();
    res.send(result);
  } catch (err) {
    return res.status(401).send(err.message);
  }
});

module.exports = router;
