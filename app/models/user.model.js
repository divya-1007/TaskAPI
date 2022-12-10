module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("user", {
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    gender:{
      type:Sequelize.STRING,
      allowNull:false
    },
    password: {
      type: Sequelize.STRING
    },
    role: {
      type: Sequelize.STRING,
    }
  },{ timestamps: true });

  return User;
};
