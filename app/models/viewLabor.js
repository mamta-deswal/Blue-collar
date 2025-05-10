const mongoose = require('mongoose');

const UserViewSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  views: { type: Number, default: 0 },
  hasPaid: { type: Boolean, default: false }, 
  name: { type: String, required: true },
  address: { type: String, required: true },
  pincode: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('UserView', UserViewSchema);
