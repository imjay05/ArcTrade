const mongoose = require("mongoose");

const { HoldingsSchema } = require("../schemas/HoldingsSchema");
const { OrdersSchema } = require("../schemas/OrdersSchema");
const { UserSchema } = require("../schemas/UserSchema");
const { PaymentSchema } = require("../schemas/PaymentSchema");

const HoldingsModel = mongoose.model("holding", HoldingsSchema);
const OrdersModel = mongoose.model("order", OrdersSchema);
const UserModel = mongoose.model("user", UserSchema);
const PaymentModel = mongoose.model("payment", PaymentSchema);

module.exports = { HoldingsModel, OrdersModel, UserModel, PaymentModel };