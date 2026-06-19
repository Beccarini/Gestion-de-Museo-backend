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
const Proyecto = require('./proyecto')(sequelize);
const Permiso = require('./permiso')(sequelize);
const IntegranteProyecto = require('./integranteProyecto')(sequelize);
const IntegrantePermiso = require('./integrantePermiso')(sequelize);
const Item = require('./item')(sequelize);
const Recurso = require('./recurso')(sequelize);
const Cambio = require('./cambio')(sequelize);

Integrante.hasMany(Registro, { foreignKey: 'integranteId', as: 'registros' });
Registro.belongsTo(Integrante, { foreignKey: 'integranteId', as: 'integrante' });

Recurso.hasMany(Item, { foreignKey: 'recursoId', as: 'items' }); 
Item.belongsTo(Recurso, { foreignKey: 'recursoId', as: 'recurso' });

Recurso.hasMany(Cambio, { foreignKey: 'recursoId', as: 'cambios' });
Cambio.belongsTo(Recurso, { foreignKey: 'recursoId', as: 'recurso' });

Item.hasOne(Cambio, { foreignKey: 'itemId', as: 'cambio' });
Cambio.belongsTo(Item, { foreignKey: 'itemId', as: 'item' });

Integrante.belongsToMany(Proyecto, {
  through: IntegranteProyecto,
  foreignKey: 'integranteId',
  otherKey: 'proyectoId',
  as: 'proyectos',
  onDelete: 'CASCADE'
});
Proyecto.belongsToMany(Integrante, {
  through: IntegranteProyecto,
  foreignKey: 'proyectoId', 
  otherKey: 'integranteId',
  as: 'integrantes'
});

Integrante.belongsToMany(Permiso, {
  through: IntegrantePermiso,
  foreignKey: 'integranteId',
  otherKey: 'permisoId',
  as: 'permisos',
  onDelete: 'CASCADE'
});
Permiso.belongsToMany(Integrante, {
  through: IntegrantePermiso,
  foreignKey: 'permisoId',
  otherKey: 'integranteId',
  as: 'integrantes'
});

module.exports = {
  sequelize,
  Integrante,
  Registro,
  Recurso,
  Cambio,
  Item,
  Proyecto,
  Permiso,
  IntegranteProyecto,
  IntegrantePermiso
};