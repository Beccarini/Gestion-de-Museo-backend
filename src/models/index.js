const path = require('path');
const { Sequelize } = require('sequelize');

const sqliteStorage = process.env.NODE_ENV === 'test'
  ? ':memory:'
  : path.resolve(__dirname, '../../database.sqlite');


const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: sqliteStorage,
  logging: false
});

const Integrante = require('./integrante')(sequelize);  
const Registro = require('./registro')(sequelize); 

Integrante.hasMany(Registro, { foreignKey: 'integranteId', as: 'registros' });
Registro.belongsTo(Integrante, { foreignKey: 'integranteId', as: 'integrante' });

module.exports = {
  sequelize,
  Integrante,
  Registro
};
