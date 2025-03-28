const User = require("../models/auth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("joi");

const signupSchema = Joi.object({
  first_name: Joi.string().min(2).max(30).required(),
  last_name: Joi.string().min(2).max(30).required(),
  mobile: Joi.string().pattern(/^[0-9]{10}$/).required(),
  password: Joi.string().min(6).required(),
  dob: Joi.date().iso().required(),
  address: Joi.string().required(),
  pincode: Joi.string().pattern(/^[0-9]{6}$/).required()
});

const loginSchema = Joi.object({
  mobile: Joi.string().pattern(/^[0-9]{10}$/).required(),
  password: Joi.string().min(6).required()
});

// Signup  
exports.signup = async (req, res) => {
  try {
    const { error } = signupSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { first_name, last_name, mobile, password, dob, address, pincode } = req.body;

    let user = await User.findOne({ mobile });
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ first_name, last_name, mobile, password: hashedPassword, dob, address, pincode });
    await user.save();

    res.status(201).json({ message: "Signup successful! Please log in." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login  
exports.login = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { mobile, password } = req.body;
    const user = await User.findOne({ mobile });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({
      message: "Logged in successfully",
      token,
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        mobile: user.mobile,
        dob: user.dob,
        address: user.address,
        pincode: user.pincode,
        user_type: user.user_type,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Logout 
exports.logout = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No or invalid token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};
