const { DataTypes, Sequelize } = require("sequelize");

const sequelize = new Sequelize("rank", {
  host: "localhost",
  dialect: "sqlite",
  logging: false,
  storage: "./database/database.sqlite",
});

const Rank = sequelize.define("rank", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    required: true,
    unique: true,
    allowNull: false,
  },
  name: DataTypes.STRING,
  wins: DataTypes.INTEGER,
  losses: DataTypes.INTEGER,
});

module.exports = Rank;
