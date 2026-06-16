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

Integrante.hasMany(Registro, { foreignKey: 'integranteId', as: 'registros' });
Registro.belongsTo(Integrante, { foreignKey: 'integranteId', as: 'integrante' });

Integrante.belongsToMany(Proyecto, {
  through: IntegranteProyecto,
  foreignKey: 'integranteId',
  otherKey: 'proyectoId',
  as: 'proyectos'
});
Proyecto.belongsToMany(Integrante, {
  through: IntegranteProyecto,
  foreighKey: 'proyectoId',
  otherKey: 'integranteId',
  as: 'integrantes'
});
Integrante.belongsToMany(Permiso, {
  through: IntegrantePermiso,
  foreignKey: 'integranteId',
  otherKey: 'permisoId',
  as: 'permisos'
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
  Proyecto,
  Permiso,
  IntegranteProyecto,
  IntegrantePermiso
};
