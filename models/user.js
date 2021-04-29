require("dotenv").config();
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  surname: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 1024,
  },
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      name: this.name,
      surname: this.surname,
      email: this.email,
      isAdmin: this.isAdmin,
    },
    process.env.jwtPrivateKey
  );
  return token;
};

const User = mongoose.model("User", userSchema);

function validateUser(user) {
  const schema = {
    name: Joi.string().min(3).max(50).required(),
    surname: Joi.string().min(2).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(4).max(1024).required(),
  };

  return Joi.validate(user, schema);
}

exports.User = User;
exports.validate = validateUser;
