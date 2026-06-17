const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Permiso', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        fechaHoraInicio: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        },
        fechaHoraFin: {
            type: DataTypes.DATE,
            allowNull: true
        },
        esAcceso: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false
        }
        
    }, {
        timestamps: true,
        tableName: 'permisos'
    });
};
