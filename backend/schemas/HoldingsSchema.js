const { Schema } = require("mongoose");

const HoldingsSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  name: String,
  qty: Number,
  avg: Number,
  price: Number,
  net: String,
  day: String,
  isLoss: {
    type: Boolean,
    default: false,
  },
});

module.exports = { HoldingsSchema };