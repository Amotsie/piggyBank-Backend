require("dotenv").config();
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const sendMail = require("../utils/sendEmail");
const { validate, User } = require("../models/user");
const Joi = require("joi");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

//Reteun all users [ADMIN ONLY]
router.get("/", [auth, admin], async (req, res) => {
  const users = await User.find()
    .lean()
    .select({ password: 0, __v: 0 })
    .then((users) => {
      if (users.length > 0) return res.send(users);
    })
    .catch((error) => res.status(404).send(error.message));
});

//Get one user
router.get("/:id", [auth], async (req, res) => {
  let userId = req.params.id;
  const user = await User.find({ userId })
    .select({ _v: 0, password: 0 })
    .then((user) => {
      if (!user || user.length < 1) throw new Error();
      return res.send(user);
    })
    .catch((error) =>
      res.status(404).send("The User with the given ID was not found.")
    );
});

//Delete user by ID
router.delete("/:id", [auth, admin], async (req, res) => {
  let id = req.params.id;
  try {
    const user = await User.findByIdAndRemove(id);
    if (user)
      return res.send(_.pick(user, ["_id", "name", "surname", "email"]));
    throw new Error("The User with the given ID was not found.");
  } catch (error) {
    return res.status(404).send(error.message);
  }
});

//Create new User
// create 6 digit passwords automatically for the user and send email.
router.post("/register", async (req, res) => {
  // let newPassword = generatePassword();
  // req.body = { ...req.body, password: newPassword };

  const { error } = validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send("User already registered");

    user = new User(
      _.pick(req.body, ["name", "surname", "email", "password", "isAdmin"])
    );

    if (
      req.body.email === process.env.APP_ADMIN1 ||
      req.body.email === process.env.APP_ADMIN2
    ) {
      user.isAdmin = true;
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    await user.save();

    // createSendMail(user, newPassword);
    const token = user.generateAuthToken();
    res
      .header("x-auth-token", token)
      .send(_.pick(user, ["_id", "name", "surname", "email", "isAdmin"]));
  } catch (error) {
    console.log(error.message);
    res.status(404).send(error.message);
  }
});

//Update User
router.put("/:id", [auth, admin], async (req, res) => {
  const id = req.params.id;

  console.log("PARAMS ID: ", id);

  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const user = await User.findByIdAndUpdate(id, req.body, {
      new: true,
    }).select({ password: 0, __v: 0 });

    if (!user) throw new Error();
    res.send(user);
  } catch (error) {
    return res.status(404).send("The User with the given ID was not found.");
  }
});

function validateUser(user) {
  console.log("validating..........");
  const schema = {
    name: Joi.string().min(2).max(50),
    surname: Joi.string().min(2).max(50),
    email: Joi.string().min(5).max(255),
    password: Joi.string().min(5).max(1024),
  };

  return Joi.validate(user, schema);
}

function generatePassword() {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function createSendMail(user, password) {
  let options = {
    to: user.email,
    subject: "Smart Piggy-New Account.",
    text:
      `<h2>Welcome</h2> user.name` +
      "\n A new accound has been created for you, your login details are as follows: \n" +
      "username: your email Anddress \n" +
      "password: " +
      password +
      "\n" +
      "<i>Enjoy the app and happy savings..</i> 😀",
  };

  sendMail(options);
}

module.exports = router;
