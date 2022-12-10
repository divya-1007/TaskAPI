const jwt = require('jsonwebtoken');
exports.authsJwt = async function (req, res, next) {
  
  try{
      let token = req.header('authorization');
        token = token.split(" ")[1];
          if (!token){
              return res.status(400).json({
                  status: 0,
                  message: 'Access Denied'
              });
          }
          try {
              const verified = jwt.verify(token, process.env.jsonSecretToken);
              req.user = verified;
              next();
          }
          catch(e) {
              res.status(400).json({
                  status: 55,
                  message: 'Invalid Token or Token Expire',
                  error  : e
              });
          }
  } catch (error) {
      res.status(500).json({
          status: 0,
          message: 'Something Happened Contact Support',
          error  : error
      });
  }
};
exports.userMiddleware = (req, res, next) => {
  if (req.user.role !== "user") {
    return res.status(400).json({ message: 'User Access denied' });
  }
  next();
}

exports.adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(400).json({ message: 'Admin Access denied' });
  }
  next();
}