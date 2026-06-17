const path = require('path');
const { Sequelize } = require('sequelize');
const recurso = require('./recurso');

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
const Item = require('./item')(sequelize);
const Recurso = require('./recurso')(sequelize);
const Cambio = require('./cambio')(sequelize);
Integrante.hasMany(Registro, { foreignKey: 'integranteId', as: 'registros' });
Registro.belongsTo(Integrante, { foreignKey: 'integranteId', as: 'integrante' });
Recurso.hasMany(Item,{foreignKey: 'itemId', as: 'items'});
Item.belongsTo(Recurso,{foreignKey: 'itemId', as:'recurso'});
Recurso.hasMany(Cambio,{foreignKey:'cambioId',as: 'cambios'});
Cambio.belongsTo(Recurso,{foreignKey:'cambioId',as:'recurso'});
Item.hasOne(Cambio,{foreignKey:'cambioId',as: 'cambios'});
Cambio.belongsTo(Item,{foreignKey:'cambioId',as:'item'});
module.exports = {
  sequelize,
  Integrante,
  Registro,
  Recurso,
  Cambio,
  Item
};
