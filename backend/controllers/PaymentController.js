const Razorpay = require("razorpay");
const crypto = require("crypto");
const { PaymentModel, UserModel } = require("../model/index");


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount < 1) {
      return res.status(400).json({ success: false, message: "Minimum amount is ₹1." });
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: req.user.userId,
        purpose: "Add Funds - ArcTrade",
      },
    };

    const order = await razorpay.orders.create(options);

    await PaymentModel.create({
      userId: req.user.userId,
      razorpayOrderId: order.id,
      amount,
      currency: "INR",
      status: "created",
      type: "ADD_FUNDS",
    });

    return res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Razorpay create order error:", err);
    return res.status(500).json({ success: false, message: "Payment initiation failed." });
  }
};


const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed. Invalid signature." });
    }

    const payment = await PaymentModel.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "paid",
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment record not found." });
    }

    const user = await UserModel.findOneAndUpdate(
      { userId: payment.userId },
      { $inc: { walletBalance: payment.amount } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: `₹${payment.amount} added to your wallet successfully!`,
      walletBalance: user.walletBalance,
    });
  } catch (err) {
    console.error("Payment verify error:", err);
    return res.status(500).json({ success: false, message: "Payment verification failed." });
  }
};


module.exports = { createOrder, verifyPayment };