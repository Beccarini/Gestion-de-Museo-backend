const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Registro', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    fecha: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW 
    },
    esAsistencia: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    esApertura: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
  }, {
    timestamps: true, 
    tableName: 'registros'
  });
};
