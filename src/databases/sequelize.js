const Sequelize = require('sequelize');
const Config = require('../utils/config');

const c = new Config();

const sequelize = new Sequelize(
  process.env.SQL_DATABASE,
  process.env.SQL_USERNAME,
  process.env.SQL_PASSWORD,
  { host: process.env.SQL_HOST, dialect: 'mysql', logging: false }
);

module.exports = sequelize;
