require("dotenv").config();
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { User } = require("../models/user");

//Login---------Login
router.post("/", async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  try {
    let user = await User.findOne({ email: req.body.email });

    if (!user) return res.status(400).send("Ivalid Email or Password");

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) return res.status(400).send("Ivalid Email or Password");

    //-----------------JWT
    const token = user.generateAuthToken();

    res.send({
      token,
      user: _.pick(user, ["_id", "name", "surname", "email", "isAdmin"]),
    });
  } catch (error) {
    res.status(404).send(error.message);
  }
});

function validateUser(req) {
  const schema = {
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(4).max(1024).required(),
  };

  return Joi.validate(req, schema);
}

module.exports = router;
