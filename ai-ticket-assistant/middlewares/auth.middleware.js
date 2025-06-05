import jwt from "jsonwebtoken";

export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ err: "Access Denied, User not found" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res
      .status(500)
      .json({ err: "Invalid token", details: error.message });
  }
};
