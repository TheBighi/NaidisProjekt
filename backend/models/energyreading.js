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
      id: {
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
          type: DataTypes.DECIMAL(10, 2),
          allowNull: true
      },
      source: {
          type: DataTypes.STRING,
          allowNull: false
      },
      updatedAt: DataTypes.DATE,
      createdAt: DataTypes.DATE
  }, {
      sequelize,
      modelName: 'EnergyReading',
      timestamps: false,
      indexes: [
          {
              unique: true,
              fields: ['timestamp', 'location']
          }
      ]
  });
  return EnergyReading;
};