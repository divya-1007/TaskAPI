const CustomErrorHandler = require("../utils/errorhandler");
const serviceFunction = require("../utils/service.provide");

exports.authsJwt = async function (req, res, next) {
  try {
    let token = req.header("authorization");
    token = token.split(" ")[1];
    if (!token) {
      return next(CustomErrorHandler.unAuthorized("Access Denied"));
    }
    try {
      const verified = await serviceFunction.tokenverify(token)
      req.user = verified;
      next();
    } catch (e) {
      return next(
        CustomErrorHandler.unAuthorized(
          "Invalid Token or Token Expire" + " " + e
        )
      );
    }
  } catch (error) {
    return next(
      CustomErrorHandler.unAuthorized(
        "Something Happened Contact Support" + " " + error
      )
    );
  }
};
exports.userMiddleware = (req, res, next) => {
  if (req.user.role === "user") {
    next();
  }else{
    return next(CustomErrorHandler.unAuthorized("User Access denied"))
  }
};

exports.adminMiddleware = (req, res, next) => {
  if (req.user.role === "admin") {
  next();
  }else{
    return next(CustomErrorHandler.unAuthorized("Admin Access denied"));
  }
};
