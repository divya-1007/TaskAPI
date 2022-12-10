const dbConfig = require("../config/db.config.js");

const {Sequelize ,DataTypes} = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  logging:false,
  // operatorsAliases: false,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

sequelize.authenticate()
.then(()=>{
  console.log('Database Connected');
}).catch((error)=>{
  console.log('error '+error );
})
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.user = require("./user.model.js")(sequelize, Sequelize,DataTypes);


module.exports = db;
