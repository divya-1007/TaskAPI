const express = require("express");
const cors = require("cors");
const session = require('express-session')
const helmet = require('helmet');
const app = express();
const controller = require('./app/controllers/user.controller')

var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

app.set('view engine', 'ejs');
// set security HTTP headers
app.use(helmet());

// parse json request body
app.use('/public', express.static('public'));

// session
app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: true
}))

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended:false }));

const db = require("./app/models");

// Database connection
db.sequelize.sync({force:false})
.then(() => {
  console.log("yes re-sync.");
})
.catch((err) => {
  console.log("Failed to sync db: " + err.message);
});


// simple route
app.get("/", async(req, res) => {
  const Url = 'https://api.chucknorris.io/jokes/random'
  const requestData = await controller.randomJoke(Url)
  res.render('indexJoke', {
    requestData:requestData
  })
});

require("./app/routes/user.routes")(app);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Endpoint Not Found');
  err.status =  404;
  next(err);
});

// Error handler
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  res
    .status(err.status || 500)
    .send(err.message);
});


// set port, listen for requests
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

