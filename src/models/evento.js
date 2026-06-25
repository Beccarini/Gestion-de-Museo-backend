const { DataTypes } = require('sequelize');
const { TIPOS_EVENTO, TIPOS_EVENTO_MENSAJE } = require('../constants/tiposEvento');
module.exports = (sequelize) => {
    const Evento = sequelize.define('Evento', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: 'El nombre del evento es obligatorio' }
            }
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        tipo: {
            type: DataTypes.ENUM(...TIPOS_EVENTO),
            allowNull: false,
            defaultValue: 'clase',
            validate: {
                isIn: {
                    args: [TIPOS_EVENTO],
                    msg: TIPOS_EVENTO_MENSAJE
                }
            }
        },
        fechaInicio: {
            type: DataTypes.DATE, 
            allowNull: false,
            validate: {
                isDate: true
            }
        },
        fechaFin: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                isDate: true
            }
        },
        plantillaId: {
            type: DataTypes.UUID,
            allowNull: true 
        }
    }, {
        tableName: 'eventos',
        timestamps: true
    });

    return Evento;
};