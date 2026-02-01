import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import { connectDB } from "../lib/db.js";

export const getProfile = async (req, res) => {
  try {
    await connectDB();

    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  const { name, phone } = req.body || {};

  try {
    await connectDB();

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (phone) user.phone = phone;

    await user.save();

    res.json({
      success: true,
      message: "Profile updated",
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const createAdmin = async (req, res) => {
  const { email,role } = req.body || {};

  try {

    if(!role) return res.status(404).json({ message: "Role not provided" });

    if(!email) return res.status(404).json({ message: "Email not provided" });

    await connectDB();

    const user = await User.findOne({ email : email});
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = "super-admin";

    await user.save();

    res.json({
      success: true,
      message: "Profile updated",
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


export const addAddress = async (req, res) => {
  const address = req.body;

  try {
    await connectDB();

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // If new address is default, unset previous defaults
    if (address.isDefault) {
      user.addresses.forEach(a => (a.isDefault = false));
    }

    user.addresses.push(address);
    await user.save();

    res.status(201).json({
      success: true,
      addresses: user.addresses
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateAddress = async (req, res) => {
  const index = Number(req.params.index);
  const updated = req.body;

  try {
    await connectDB();

    const user = await User.findById(req.userId);
    if (!user || !user.addresses[index]) {
      return res.status(404).json({ message: "Address not found" });
    }

    if (updated.isDefault) {
      user.addresses.forEach(a => (a.isDefault = false));
    }

    user.addresses[index] = {
      ...user.addresses[index].toObject(),
      ...updated
    };

    await user.save();

    res.json({
      success: true,
      addresses: user.addresses
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteAddress = async (req, res) => {
  const index = Number(req.params.index);

  try {
    await connectDB();

    const user = await User.findById(req.userId);
    if (!user || !user.addresses[index]) {
      return res.status(404).json({ message: "Address not found" });
    }

    user.addresses.splice(index, 1);
    await user.save();

    res.json({
      success: true,
      addresses: user.addresses
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    await connectDB();

    const orders = await Order.find({ user: req.userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getRole = async (req,res) =>{
  try {
    await connectDB();

    const user = await User.findById(req.userId).select("-password +role");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ success: true, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};