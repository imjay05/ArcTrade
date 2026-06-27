const { Schema } = require("mongoose");

const PaymentSchema = new Schema(
  {
    userId: { 
        type: String, 
        required: true 
    },
    razorpayOrderId: { 
        type: String, 
        required: true 
    },
    razorpayPaymentId: { 
        type: String, 
        default: null 
    },
    razorpaySignature: { 
        type: String, 
        default: null 
    },
    amount: { 
        type: Number, 
        required: true 
    },
    currency: { 
        type: String, 
        default: "INR" 
    },
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
    },
    type: {
      type: String,
      enum: ["ADD_FUNDS", "WITHDRAW"],
      default: "ADD_FUNDS",
    },
  },
  { timestamps: true }
);

module.exports = { PaymentSchema };