const mongoose = require("mongoose");
const loginSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
// const recentLoginData = [
    
// ]
const collectionlogin = new mongoose.model("Login",loginSchema)
// const uniqueEmails = new Set(recentLoginData.map(({ email }) => email));

module.exports = collectionlogin
