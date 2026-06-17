const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Proyecto', {
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
            type: DataTypes.TEXT,
            allowNull: true
        },
        fechaInicio: {
            type: DataTypes.DATE,
            allowNull: true
        },
        fechaFin: {
            type: DataTypes.DATE,
            allowNull: true
        },
        estado: {
            type: DataTypes.STRING,
            defaultValue: 'Activo',
            allowNull: false
        }
    }, {
        timestamps: true,
        tableName: 'proyectos'
    })
}