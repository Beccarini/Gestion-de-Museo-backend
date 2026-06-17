const { DataTypes } = require('sequelize');


module.exports = (sequelize) => {
    return sequelize.define('IntegrantePermiso', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        integranteId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'integrantes',
                key: 'id'
            }
        },
        permisoId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'permisos',
                key: 'id'
            }
        }
    }, {
        timestamps: true,
        tableName: 'integrante_permisos'
    });
};