const Joi = require("joi");
const mongoose = require("mongoose");


const transactionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  amount: {
    type: Number,
    required: true,
  },
  failedCoins: {
    type: Number,
    default: 0,
  },
  coins: Object,
});

const Transaction = mongoose.model("Transaction", transactionSchema);

function validateTransaction(transaction) {
  let service = Joi.object().keys({
    value: Joi.number().required(),
    qty: Joi.number().required(),
  });

  const schema = {
    userId: Joi.string().min(5).max(255).required(),
    amount: Joi.number().required(),
    failedCoins: Joi.number(),
    coins: Joi.array().items(service),
  };

  return Joi.validate(transaction, schema);
}

exports.transactionSchema = transactionSchema;
exports.Transaction = Transaction;
exports.validate = validateTransaction;
