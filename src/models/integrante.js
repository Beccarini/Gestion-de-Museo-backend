const { DataTypes } = require('sequelize');
const CARRERAS_VALIDAS = require('../constants/carreras'); 

module.exports = (sequelize) => {
  return sequelize.define('Integrante', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    token: {
      type: DataTypes.STRING,
      allowNull: true 
    },
    legajo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }, 
    carrera: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isIn: {
          args: [CARRERAS_VALIDAS],
          msg: "La carrera especificada no es válida en la UTN FRSFCO."
        }
    },
    esActivo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, 
      allowNull: false
    }
  }}, {
    timestamps: true, 
    tableName: 'integrantes'
  });
};
