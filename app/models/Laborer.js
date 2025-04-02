const mongoose = require("mongoose");

const laborSchema = new mongoose.Schema({
  name: { type: String, required: true },
  area: { type: String, required: true },
  pincode: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  service: { type: String, required: true },
  city: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  location: {
    type: { type: String, default: "Point" },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
});

laborSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Labor", laborSchema);
