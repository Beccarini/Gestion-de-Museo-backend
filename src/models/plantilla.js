const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Plantilla = sequelize.define('Plantilla', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false
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
                    msg: 'El tipo de plantilla no es válido'
                }
            }
        },
        diaSemana: {
            type: DataTypes.INTEGER, 
            allowNull: false
        },
        horaInicio: {
            type: DataTypes.STRING(5), 
            allowNull: false
        },
        horaFin: {
            type: DataTypes.STRING(5), 
            allowNull: false
        },
        frecuencia: {
            type: DataTypes.ENUM('semanal', 'quincenal', 'mensual'),
            allowNull: false,
            defaultValue: 'semanal'
        },
        ultimaProyeccion: {
            type: DataTypes.DATEONLY, 
            allowNull: true
        },
        activo: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true 
        }
    }, {
        tableName: 'plantillas', 
        timestamps: true        
    });

    return Plantilla;
};