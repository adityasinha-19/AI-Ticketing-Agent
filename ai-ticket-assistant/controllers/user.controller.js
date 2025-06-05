import { inngest } from "../inngest/client.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  const { email, password, skills = [] } = req.body;

  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashed, skills });

    const createdUser = await User.findById(user._id).select("-password");

    if (!createdUser) {
      return res.status(500).json({ error: "New User not created" });
    }

    // fire inngest event
    await inngest.send({
      name: "user/signup",
      data: { email },
    });

    const token = jwt.sign(
      { _id: createdUser._id, role: createdUser.role },
      process.env.JWT_SECRET
    );

    res.json({ createdUser, token });
  } catch (error) {
    res.status(500).json({ error: "signup failed", details: error.message });
  }
};

export const login = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: "Password not matched" });
    }

    const token = jwt.sign(
      { _id: createdUser._id, role: createdUser.role },
      process.env.JWT_SECRET
    );

    res.json({ createdUser, token });
  } catch (error) {
    res.status(500).json({ error: "Login failed", details: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: "Unauthorized" });
      }
    });

    res.json({ message: "Logout successfully" });
  } catch (error) {
    res.status(500).json({ error: "Login failed", details: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { skills = [], role } = req.body;
  try {
    if (req.user?.role === "admin") {
      return res.status(403).json({ err: "forbidden" });
    }
    const user = await User.findById(req.user._id);
    if (!user) return res.status(401).json({ err: "User not found" });

    await User.updateOne(req.user._id, {
      skills: skills.length ? skills : user.skills,
      role,
    });

    return res.status(200).json({ message: "User updated succesfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "user update failed", details: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    if (req.user?._id !== "admin")
      return res.status(401).json({ message: "access denied" });

    const users = await User.find().select("-password");
    if (!users) return res.status(500).json({ message: "users not found" });

    return res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ err: "Users not found", details: error.message });
  }
};
