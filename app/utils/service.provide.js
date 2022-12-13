const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
require("dotenv").config();

const serviceFunction = {
  passwordHashGenerate: async (passwordhash = false, requestData) => {
    const salt = await bcrypt.genSalt(10);
    let hashedPassword = await bcrypt.hash(requestData.password, salt);

    if (passwordhash === true) {
      return hashedPassword;
    } else {
      const createUser = {
        firstName: requestData.firstName,
        lastName: requestData.lastName,
        gender: requestData.gender,
        password: hashedPassword,
        email: requestData.email,
        role: "user",
      };
      return createUser;
    }
  },

  tokenGenerate: async (findUser) => {
    const token = jwt.sign(
      { key: findUser.id, role: findUser.role },
      process.env.jsonSecretToken,
      { expiresIn: "87660h" }
    );

    let details = {
      firstname: findUser.firstname,
      lastName: findUser.lastName,
      email: findUser.email,
      id: findUser.id,
      token: token,
      role: findUser.role,
    };
    return details;
  },

  tokenverify:async(token ,secret = process.env.jsonSecretToken)=>{
   return jwt.verify(token, secret)
  },
};

module.exports = serviceFunction;
