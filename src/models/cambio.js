const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('Cambio', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    razon: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Razón génerica'
    }
  }, {
    timestamps: true, 
    tableName: 'cambio'
  });
};
