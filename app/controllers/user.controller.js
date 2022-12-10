const db = require("../models");
const bcrypt = require('bcrypt'); 
var jwt = require("jsonwebtoken");
const https = require('https')
require('dotenv').config()
const User = db.user;
const Op = db.Sequelize.Op;


// Create a signup
exports.createSignup = async(req, res) => {
  try {
  // Validate request
  if (!req.body) {
    return  res.status(400).send({ message: "Content can not be empty!"});
  }

const {firstName,lastName ,gender,password ,email} = req.body

const findUser = await User.findOne({ where: { email: email }});

if(findUser){
  return res.status(400).send({message: "Username Already Taken"})
}

const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);
  
  const createUser = {
    firstName: firstName,
    lastName: lastName,
    gender: gender,
    password: hashedPassword,
    email: email ,
    role:'user'
  };


  User.create(createUser)
    .then(data => { return res.status(200).send(data);})
    .catch(err => {return res.status(500).send({ message: err.message || "Some error occurred while creating the User."});});
  
  } catch (error) {
    return res.status(500).send({ message:`Server Error : ${error.toString()}`})
  }
};

// Create a Login
exports.CreateLogin = async(req,res)=>{
  try {
  const {email ,password} = req.body
   const findUser = await User.findOne({ where: { email: email }});
 
   if(findUser === null){
    return  res.status(400).send({message: "User not found. Please check your credentials",});
   }
 
  const match = await bcrypt.compare(password, findUser.password);
  if(!match){
    return res.status(400).send({message:'Username or password is wrong'})
  }
  const token = jwt.sign(
    { key: findUser.id, role: findUser.role },
    process.env.jsonSecretToken,
    { expiresIn: "87660h" }
  );

  let details = {
    firstname: findUser.firstname,
    lastName: findUser.lastName,
    email:findUser.email,
    id: findUser.id,
    token: token,
    role: findUser.role,
  };
  req.session.user = details
  res.cookie("token", details);
  return res.status(200).send({message: "Success", data: details,});

  } catch (error) {
    return res.status(500).send({message:`Server Error : ${error.toString()}`})
  }

}

// Retrieve all User from the database.
exports.findAllUser = async(req, res) => {
  try {
  
  const { page, size} = req.query;
  const { limit, offset } = getPagination(parseInt(page), parseInt(size));

 await User.findAndCountAll({where: { role: "user" }, limit, offset  })
    .then(data => {
      const response = getPagingData(data, page, limit);
      // console.log(response ,"hello");
      return res.status(200).send(response);
    })
    .catch(err => {
      return res.status(500).send({message:err.message || "Some error occurred while retrieving User." });});
  } catch (error) {
   return res.status(500).send({message:`Server Error : ${error.toString()}`}) 
  }
};

// Find a single Uase with an id
exports.findOneUser = async(req, res) => {
  const id = req.params.id;

await User.findByPk(id)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving User with id=" + id
      });
    });
};

// Update a User by the id in the request
exports.updateUser = async(req, res) => {
  const id = req.params.id;
  const {firstName ,lastName ,gender} = req.body
    const updateData = {
      firstName: firstName,
      lastName: lastName,
       gender: gender,
      }
 await User.update(updateData, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "User updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update User with id=${id}. Maybe User was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating User with id=" + id
      });
    });
};

// Delete a User with the specified id in the request
exports.deleteUser = async(req, res) => {
  const id = req.params.id;
console.log(id);
 await User.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "User deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete User with id=${id}. Maybe User was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete User with id=" + id
      });
    });
};

// LogoutUser
exports.LogoutUser = async(req,res)=>{
  try {
    var sess = req.session;
    // console.log(sess);
    if(sess.user !== undefined){
      req.session.user = null;
      return res.status(200).send({success: true, message: "user logout successfully"});
    }else{
      return res.status(400).send({message:"User Not logout"})
    }
  } catch (error) {
   return res.status(500).send({message:`Server Error : ${error.toString()}`}) 
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