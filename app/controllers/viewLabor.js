const Labor = require("../models/Laborer");
const UserView = require("../models/viewLabor");
const User = require("../models/auth");
const { initiatePayment } = require("../util/viewPayment");

exports.viewLaborDetails = async (req, res) => {
  try {
    const { phone } = req.params;
    const { userPhone } = req.query;

    if (!phone || !userPhone) {
      return res
        .status(400)
        .json({ message: "Missing required phone numbers" });
    }

    const user = await User.findOne({ mobile: userPhone });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let userView = await UserView.findOne({ phone: userPhone });
    if (!userView) {
      userView = new UserView({
        phone: userPhone,
        name: `${user.first_name} ${user.last_name}`,
        address: user.address,
        pincode: user.pincode,
        views: 0,
        hasPaid: false,
      });
    }

    if (userView.views >= 10 && !userView.hasPaid) {
      return res
        .status(402)
        .json({ message: "View limit reached. Payment required." });
    }

    const labor = await Labor.findOne({ phone });
    if (!labor) {
      return res.status(404).json({ message: "Labor not found" });
    }

    userView.views += 1;

    if (userView.views > 10) {
      userView.hasPaid = false;
    }

    await userView.save();

    res.status(200).json({
      name: labor.name,
      phone: labor.phone,
      service: labor.service,
      fullAddress: labor.fullAddress,
    });
  } catch (error) {
    console.error("Error fetching labor details:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Handle Payment and Reset Views
exports.handlePayment = async (req, res) => {
  try {
    const { phone } = req.params;

    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const amount = 20 * 100; 

    const paymentResponse = await initiatePayment(phone, amount);

    if (paymentResponse.status === "success") {
      const userView = await UserView.findOne({ phone });

      if (!userView) {
        return res
          .status(404)
          .json({
            message: "User view record not found. Please view a labor first.",
          });
      }

      userView.hasPaid = true;
      await userView.save();

      return res
        .status(200)
        .json({
          message: "Payment successful. You can now view 1 more labor.",
        });
    } else {
      return res.status(500).json({ error: "Payment failed" });
    }
  } catch (error) {
    console.error("Error in handlePayment:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

exports.getViewStatus = async (req, res) => {
  try {
    const { phone } = req.params;
    const userView = await UserView.findOne({ phone });

    if (!userView) {
      return res.status(200).json({
        viewsUsed: 0,
        viewsLeft: 10,
        message: "User has not viewed any labor yet.",
      });
    }

    const viewsLeft = Math.max(0, 10 - userView.views);

    res.status(200).json({
      viewsUsed: userView.views,
      viewsLeft,
      message:
        viewsLeft > 0
          ? `You can view ${viewsLeft} more labor profiles for free.`
          : `You have reached the limit. Please pay ₹20 to continue.`,
    });
  } catch (error) {
    console.error("Error fetching view status:", error.message);
    res.status(500).json({ error: error.message });
  }
};
