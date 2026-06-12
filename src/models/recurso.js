const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
    return sequelize.define('Recurso', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false
        },
        descripcion: {
            type: DataTypes.STRING
        },
        categoria:{
            type: DataTypes.STRING
        },
        stock: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        timestamps: true, 
        tableName: 'recurso'
    });
};