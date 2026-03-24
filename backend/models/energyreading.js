'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EnergyReading extends Model {
    static associate(models) {
    }
  }
  EnergyReading.init({
    id:{
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    price_eur_mwh: {
      type: DataTypes.NUMBER,
      allowNull: true
    },
    source: {
      type: DataTypes.STRING,
      allowNull: false
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'EnergyReading',
  });
  return EnergyReading;
};