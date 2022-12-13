const db = require("../models");
const commonService = require('../service/common.servic')
const message = require('../messagetype/message')
const serviceFunction = require('../utils/service.provide')
const CustomErrorHandler = require('../utils/errorhandler')
const https = require('https')
const bcrypt = require('bcrypt'); 
const User = db.user;
const Op = db.Sequelize.Op;


// Create a signup
exports.createSignup = async(req, res ,next) => {
  try {

const findUser = await commonService.findByQuery(User ,true,{ email: req.body.email } ,{} ,false ,false,false, ) 

if(findUser){
  return next(CustomErrorHandler.wrongCredentials(message.MessageType.USER_ALREADY)) 
}

const createUser = await serviceFunction.passwordHashGenerate(false ,req.body)

await commonService.insertByQuery(User ,createUser ,false)
 .then(data => { return res.json({status:true ,response:data})})
 .catch(err => {return next(CustomErrorHandler.serverError(err.message || message.MessageType.SERVER_ERROR))});
  
  } catch (error) {
    return next(CustomErrorHandler.serverError(`Server Error : ${error.toString()}`))
  }
};

// Create a Login
exports.CreateLogin = async(req,res ,next)=>{
  try {
   const findUser = await  commonService.findByQuery(User ,true,{ email: req.body.email } ,{} ,false ,false,false, ) 
 
   if(findUser === null){
    return next(CustomErrorHandler.wrongCredentials(message.MessageType.USER_NOT_FOUND)) 
   }
 
  const match = await bcrypt.compare(req.body.password, findUser.password)
  
  if(!match){
    return next(CustomErrorHandler.errorpasswordCompare(message.MessageType.PASSWORD_COMP_ERROR))       
  }

  const details = await serviceFunction.tokenGenerate(findUser)
  
  req.session.user = details
  res.cookie("token", details);

  return res.json({status:true,details})  

  } catch (error) {
    return  next(CustomErrorHandler.serverError(`Server Error : ${error.toString()}`))
  }

}

// Retrieve all User from the database.
exports.findAllUser = async(req, res ,next) => {
  try {
  
  const { page, size} = req.query;
  const { limit, offset } = getPagination(parseInt(page), parseInt(size));

  await  commonService.findByQuery(User ,false ,{ role: "user" } ,{} ,limit ,offset)       
    .then(data => {
      const response = getPagingData(data, page, limit);
      return res.json({status:true,response}) 
    })
    .catch(err => {
      return next(CustomErrorHandler.serverError(err.message || message.MessageType.SERVER_ERROR))})
  } catch (error) {
   return next(CustomErrorHandler.serverError(`Server Error : ${error.toString()}`))
  }
};

// Find a single Uase with an id
exports.findOneUser = async(req, res ,next) => {
  try {
    const id = req.params.id;
    await User.findByPk(id)
    .then(data => { return res.json({status:true,data})})
    .catch(err => { return next(CustomErrorHandler.serverError(`${SERVER_ERROR} id=` + id))});
  } catch (error) {
    return next(CustomErrorHandler.serverError(`Server Error : ${error.toString()}`))
  }
};

// Update a User by the id in the request
exports.updateUser = async(req, res ,next) => {
  try {
    
  const id = req.params.id;
    const updateData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
       gender: req.body.gender,
      }
 await commonService.updateByQuery(User ,true ,updateData,{id:id})
    .then(num => {
      if (num == 1) {
        res.json({ status:true, message: "User updated successfully."});
      } else {
        return next(CustomErrorHandler.wrongCredentials(`Cannot update User with id=${id}. Maybe User was not found or req.body is empty!`))
      }
    })
    .catch(err => {
      return next(CustomErrorHandler.serverError(`${SERVER_ERROR} id=` + id))
    });
  } catch (error) {
    return next(CustomErrorHandler.serverError(`Server Error : ${error.toString()}`))
  }
};

// Delete a User with the specified id in the request
exports.deleteUser = async(req, res ,next) => {
  const id = req.params.id;
 await User.destroy({where: { id: id }})
    .then(num => {
      if (num == 1) {
        res.Json({ status:true, message:message.MessageType.UPDATE_USER});
      } else {
        return next(CustomErrorHandler.wrongCredentials(`Cannot delete User with id=${id}. Maybe User was not found!`))
      }
    })
    .catch(err => {return next(CustomErrorHandler.serverError("Could not delete User with id=" + id))});
};

// LogoutUser
exports.LogoutUser = async(req,res ,next)=>{
  try {
    var sess = req.session;
    if(sess.user !== undefined){
      req.session.user = null;
      return res.status(200).send({success: true, message:message.MessageType.USER_LOGOUT });
    }else{
      return next(CustomErrorHandler.wrongCredentials("User Not logout"))
    }
  } catch (error) {
   return next(CustomErrorHandler.serverError(`Server Error : ${error.toString()}`))
  }
}


const getPagination = (page, size) => {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;
  console.log(limit ,offset ,);

  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: users } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, users, totalPages, currentPage };
};

exports.randomJoke = async(urlData)=>{
  const Url = urlData
  const option ={
    method:'get',
    headers: {  "contentType": "application/json", },
  }
 const responseData = await aPiCallJoke(Url ,option)
 return responseData;
}


function aPiCallJoke(UrlM ,option) {
  return new Promise(async (resolve, reject) => {
    
  const requests = https.request(UrlM,option , (response) => {

  const { statusCode } = response;
  const contentType = response.headers['content-type'];

  let error;
  // Any 2xx status code signals a successful response but
  // here we're only checking for 200.
  if (statusCode !== 200) {
    error = new Error('Request Failed.\n' + `Status Code: ${statusCode}`);
  } else if (!/^application\/json/.test(contentType)) {
    error = new Error('Invalid content-type.\n' + `Expected application/json but received ${contentType}`);
  }
  if (error) {
    console.error(error.message);
    // Consume response data to free up memory
    response.resume();
    return;
  }

  response.setEncoding('utf8');
    let chunks = '';

    response.on('data', function(data) {
      chunks += data;
    }).on('end', function() {
    try {
      let schema = JSON.parse(chunks);
      resolve(schema)
    } catch (e) {
      console.error(e.message);
    }
    }).on('error', (e) => {
      console.error(`Got error: ${e.message}`);
    });
   
  });
  requests.end()
})
}