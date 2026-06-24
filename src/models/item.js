const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('Item', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    recursoId:{
      type: DataTypes.UUID,
      allowNull: false
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'No seleccionado'
    }
  }, {
    timestamps: true, 
    tableName: 'item'
  });
};
