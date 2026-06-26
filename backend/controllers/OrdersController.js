const mongoose = require("mongoose");
const { OrdersModel, UserModel, HoldingsModel } = require("../model/index");


const newOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { name, qty, price, mode, orderType, validity } = req.body;

    if (!name || !qty || !mode) {
      return res.status(400).json({
        success: false,
        message: "Name, qty and mode are required.",
      });
    }
    if (!["BUY", "SELL"].includes(mode)) {
      return res.status(400).json({
        success: false,
        message: "Mode must be BUY or SELL.",
      });
    }

    const orderQty = Number(qty);
    const orderPrice = Number(price) || 0;
    const totalCost = orderQty * orderPrice;
    const userId = req.user.userId;

    if (orderQty <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0.",
      });
    }

    const user = await UserModel.findOne({ userId });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // SELL: check sufficient qty before opening transaction
    if (mode === "SELL") {
      const existing = await HoldingsModel.findOne({ userId, name });
      if (!existing || existing.qty < orderQty) {
        return res.status(400).json({
          success: false,
          message: `Cannot sell ${orderQty} qty of ${name}. You only hold ${existing?.qty || 0}.`,
        });
      }
    }

    // BUY: wallet pre-check
    if (mode === "BUY" && orderPrice > 0) {
      if (user.walletBalance < totalCost) {
        return res.status(400).json({
          success: false,
          message: `Insufficient funds. Required ₹${totalCost.toLocaleString("en-IN")} but available ₹${user.walletBalance.toLocaleString("en-IN")}`,
        });
      }
    }

    let savedOrder;

    await session.withTransaction(async () => {
      if (mode === "BUY" && orderPrice > 0) {
        await UserModel.findOneAndUpdate(
          { userId },
          { $inc: { walletBalance: -totalCost } },
          { session }
        );
      }

      if (mode === "SELL" && orderPrice > 0) {
        await UserModel.findOneAndUpdate(
          { userId },
          { $inc: { walletBalance: totalCost } },
          { session }
        );
      }

      const order = new OrdersModel({
        userId,
        name,
        qty: orderQty,
        price: orderPrice,
        mode,
        orderType: orderType || "Market",
        validity: validity || "DAY",
        status: "COMPLETE",
      });
      await order.save({ session });
      savedOrder = order;

      // Always CNC/delivery-style — update Holdings
      if (orderPrice > 0) {
        const existing = await HoldingsModel.findOne({ userId, name }).session(session);

        if (mode === "BUY") {
          if (existing) {
            const newQty = existing.qty + orderQty;
            const newAvg = ((existing.avg * existing.qty) + (orderPrice * orderQty)) / newQty;
            await HoldingsModel.findOneAndUpdate(
              { userId, name },
              {
                qty: newQty,
                avg: parseFloat(newAvg.toFixed(2)),
                price: orderPrice,
                isLoss: orderPrice < newAvg,
              },
              { session }
            );
          } else {
            await HoldingsModel.create(
              [{
                userId, name,
                qty: orderQty,
                avg: orderPrice,
                price: orderPrice,
                net: "0.00%",
                day: "0.00%",
                isLoss: false,
              }],
              { session }
            );
          }
        } else if (mode === "SELL") {
          const remainingQty = existing.qty - orderQty;
          if (remainingQty <= 0) {
            await HoldingsModel.deleteOne({ userId, name }, { session });
          } else {
            await HoldingsModel.findOneAndUpdate(
              { userId, name },
              {
                qty: remainingQty,
                price: orderPrice,
                isLoss: orderPrice < existing.avg,
              },
              { session }
            );
          }
        }
      }
    });

    return res.status(201).json({
      success: true,
      message: `${mode} order placed for ${orderQty} qty of ${name}!`,
      data: savedOrder,
    });

  } catch (err) {
    console.error("Order error:", err);
    return res.status(500).json({ success: false, message: "Failed to place order." });
  } finally {
    session.endSession();
  }
};


const getAllOrders = async (req, res) => {
  try {
    const orders = await OrdersModel.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: orders });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch orders." });
  }
};


module.exports = { newOrder, getAllOrders };