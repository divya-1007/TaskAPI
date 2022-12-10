module.exports = app => {
  const controller = require("../controllers/user.controller.js");
  const { authsJwt ,userMiddleware } = require("../autherization/authJwt");
   const {validate,loginVali,user_Validation  ,user_Update } = require("../validation/index");
  var router = require("express").Router();
 
  // Create a signup
  router.post("/signup",user_Validation(),validate, controller.createSignup);

  // Create a login
  router.post("/login",loginVali(), validate, controller.CreateLogin);

  // Retrieve all User 
  router.get("/allUser",authsJwt ,userMiddleware , controller.findAllUser);

  // Retrieve a single User with id
  router.get("/single-user/:id", authsJwt ,userMiddleware, controller.findOneUser);

  // Update a User with id
  router.post("/update-User/:id", user_Update() ,validate, authsJwt ,userMiddleware, controller.updateUser);

  // Delete a User with id
  router.delete("/delete-user/:id",authsJwt ,userMiddleware, controller.deleteUser);

  //Logout
  router.get("/Logout",authsJwt ,userMiddleware, controller.LogoutUser);

  // random-joke
  router.get('/random-joke',async(req ,res)=>{
    const Url = 'https://api.chucknorris.io/jokes/random'
    const requestData = await controller.randomJoke(Url)
    res.send(requestData)
  })
  
  app.use('/api/users', router);
};


