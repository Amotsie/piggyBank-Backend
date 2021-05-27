require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  console.log("AUTORISING....");
  const token = req.header("x-auth-token");

  if (!token) return res.status(401).send("Access Denied. No token Provided");

  try {
    const decoded = jwt.verify(token, process.env.jwtPrivateKey);
    req.user = decoded;
    console.log("***USER** ", decoded);
    next();
  } catch (error) {
    res.status(400).send("Invalid token Provided");
  }
};
