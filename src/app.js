const express = require('express');
const cors = require('cors');
const integrantesRouter = require('./routes/integrantes');
const recursosRouter = require('./routes/recursos');
const registrosRouter = require('./routes/registros')
const eventosRouter = require('./routes/eventos')
const plantillasRouter = require('./routes/plantillas'); 
const { sequelize, Integrante, Registro, Recurso, Item, Cambio, Evento, Plantilla } = require('./models');

const { iniciarCronEventos } = require('./services/cronService');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3000;

app.use('/api/integrantes', integrantesRouter);
app.use('/api/recursos', recursosRouter);
app.use('/api/registros', registrosRouter);
app.use('/api/eventos', eventosRouter);
app.use('/api/plantillas', plantillasRouter);
app.use('/api/permisos', permisosRouter);

const startServer = async () => {
  try {
    await sequelize.sync();

    iniciarCronEventos();
    console.log('⏰ Planificador de eventos diarios (Cron) activado con éxito.');

    const [usuarioPrueba, creado] = await Integrante.findOrCreate({
      where: { legajo: '19375' }, 
      defaults: {
        nombre: 'Agustin Eder',
        token: 'A1B2C3D4',          
        carrera: 'Sistemas',
        esActivo: true
      }
    });
    if (creado) {
      console.log('👤 Usuario de prueba hardcodeado creado con éxito.');
    }

    const [eventoPrueba, creadoEvento] = await Evento.findOrCreate({
      where: { nombre: 'Taller de Robotica Educativa' },
      defaults: {
        id: require('crypto').randomUUID(),
        nombre: 'Taller de Robotica Educativa',
        fechaInicio: new Date(new Date().setHours(14, 0, 0, 0)),
        fechaFin: new Date(new Date().setHours(16, 0, 0, 0)),
      }
    });
    if (creadoEvento) {
      console.log('📅 Evento de prueba inicial hardcodeado con éxito.');
    }

    const [registroPrueba, creadoRegistro] = await Registro.findOrCreate({
      where: { tokenLeido: 'A1B2C3D4' },
      defaults: {
        integranteId: usuarioPrueba.id,
        eventoId: eventoPrueba.id,
        tokenLeido: 'A1B2C3D4',
        fecha: new Date(),
        esAsistencia: true,
        esApertura: true,
        mensajeError: null
      }
    });
    if (creadoRegistro) {
      console.log('🚪 Registro de auditoría inicial de prueba creado.');
    }

    const [plantillaPrueba, creadaPlantilla] = await Plantilla.findOrCreate({
      where: { nombre: 'Diseño de Sistemas (Presencial)' },
      defaults: {
        nombre: 'Diseño de Sistemas (Presencial)',
        diaSemana: new Date().getDay(),
        horaInicio: '18:00',
        horaFin: '22:00',
        frecuencia: 'semanal',
        activo: true,
        ultimaProyeccion: null 
      }
    });
    if (creadaPlantilla) {
      console.log('📝 Plantilla de prueba para el Cron generada con éxito.');
    }

    const [permisoPrueba, creadoPermiso] = await Permiso.findOrCreate({
      where: { descripcion: 'Turno Mañana Estándar' },
      defaults: {
        descripcion: 'Turno Mañana Estándar',
        diasSemana: ['Lunes', 'Miércoles', 'Viernes'], // Array de ejemplo
        horaInicio: '08:00',
        horaFin: '12:30'
      }
    });

    if (creadoPermiso) {
      console.log('🔑 Nivel de acceso de prueba creado con éxito.');
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app; 