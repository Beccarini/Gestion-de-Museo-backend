const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const HorarioRecurrente = sequelize.define('HorarioRecurrente', {
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
    });

    return HorarioRecurrente;
};