const { DataTypes } = require('sequelize');

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
            type: DataTypes.ENUM('clase', 'reunion', 'visita', 'mantenimiento', 'otro'),
            allowNull: false,
            defaultValue: 'clase',
            validate: {
                isIn: {
                    args: [['clase', 'reunion', 'visita', 'mantenimiento', 'otro']],
                    msg: 'El tipo de evento no es válido'
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