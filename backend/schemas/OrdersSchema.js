const { Schema } = require("mongoose");

const OrdersSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    qty: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    mode: {
      type: String,
      enum: ["BUY", "SELL"],
      required: true,
    },
    orderType: {
      type: String,
      default: "Market",
    },
    validity: {
      type: String,
      default: "DAY",
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETE", "CANCELLED"],
      default: "COMPLETE",
    },
  },
  { timestamps: true }
);

module.exports = { OrdersSchema };