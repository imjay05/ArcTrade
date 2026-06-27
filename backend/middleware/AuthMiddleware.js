const jwt = require("jsonwebtoken");
const { UserModel } = require("../model/index");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized. No token provided.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await UserModel.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Token invalid or expired.",
    });
  }
};

module.exports = { protect };