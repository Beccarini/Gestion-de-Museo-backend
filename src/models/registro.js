const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Registro', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    integranteId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'integrantes', 
          key: 'id'             
        }
    },
    eventoId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Eventos',
            key: 'id'
        }
    },
    tokenLeido: {
      type: DataTypes.STRING,
      allowNull: false  
    },
    fecha: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    esAsistencia: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    esApertura: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    mensajeError: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    timestamps: true, 
    tableName: 'registros'
  });
};
