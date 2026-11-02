const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }
    if (token.startsWith("Bearer ")) {
      token = token.slice(7).trim();
    }
    const verify_token = jwt.verify(token, "Anuj");
    req.user = verify_token;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

module.exports =auth;