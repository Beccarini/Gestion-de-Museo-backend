const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Permiso', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: false
    },
    diasSemana: {
      type: DataTypes.STRING, //se guarda como texto porque SQLite no soporta arrays nativamente
      allowNull: false,
      get() {
        const rawValue = this.getDataValue('diasSemana');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('diasSemana', JSON.stringify(value));
      }
    },
    horaInicio: {
      type: DataTypes.STRING,
      allowNull: false
    },
    horaFin: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    timestamps: true,
    tableName: 'permisos'
  });
};