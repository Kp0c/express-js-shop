const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('shop', 'root', 'root', {
  dialect: 'mysql',
  host: 'localhost'
});

module.exports = sequelize;
