const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  mobile: { type: String, required: true },
  user_type: { type: String, default: "USER" },
  dob: { type: Date, required: true },
  address: { type: String, required: true },
  pincode: { type: String, required: true },
  password: { type: String, required: true },
});

module.exports = mongoose.model("User", userSchema);
