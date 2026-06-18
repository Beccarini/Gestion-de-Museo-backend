const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('Item', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    timestamps: true, 
    tableName: 'item'
  });
};
