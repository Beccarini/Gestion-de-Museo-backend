const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('IntegranteProyecto', { 
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        integranteId: {
            type: DataTypes.UUID,
            allowNull: false,
            reference: {
                model: 'integrantes',
                key: 'id'
            }
        },
        proyectoId: {
            type: DataTypes.UUID,
            allowNull: false,
            reference: {
                model: 'proyectos',
                key: 'id'
            }
        },

    }, {
        timestamps: true,
        tableName: 'integrante_proyectos'
    });
};