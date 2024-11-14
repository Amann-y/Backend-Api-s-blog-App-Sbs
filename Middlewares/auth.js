const jwt = require("jsonwebtoken");
const { UserModel } = require("../Models/user");

const checkUserAuth = async (req, res, next) => {
  let token;
  const { authorization } = req.headers;
 
  try {
    if (authorization && authorization.startsWith("Bearer")) {
      token = authorization.split(" ")[1];

      const { userId } = jwt.verify(token, process.env.JWT_SECRET_KEY);

      // Get user from token

      req.user = await UserModel.findById(userId).select("-password");

      next();
    }
  } catch (error) {
    res.status(401).send({ status: "failed", message: "Unauthorized User, Session Might Be Expired, Login Again" });
  }

  if (!token) {
    res
      .status(401)
      .send({ status: "failed", message: "Unauthorized User, No Token" });
  }
};

module.exports = { checkUserAuth };
