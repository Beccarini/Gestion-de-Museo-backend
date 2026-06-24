const express = require('express');
const cors = require('cors');
const integrantesRouter = require('./routes/integrantes');
const recursosRouter = require('./routes/recursos');
const registroRouter = require('./routes/registros')
const { sequelize, Integrante, Registro, Recurso, Item, Cambio } = require('./models');
const itemsRouter=require('./routes/items');
const cambiosRouter=require('./routes/cambios');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3000;

app.use('/api/integrantes', integrantesRouter);
app.use('/api/recursos', recursosRouter);
app.use ('/api/registros', registroRouter)
app.use('/api/items', itemsRouter);
app.use('/api/cambios', cambiosRouter);

const startServer = async () => {
  try {
    await sequelize.sync();
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
    } else {
      console.log('👤 El usuario de prueba ya existía en la base de datos.');
    }

    const [registroPrueba, creadoRegistro] = await Registro.findOrCreate({
      where: { tokenLeido: 'A1B2C3D4' },
      defaults: {
        integranteId: usuarioPrueba.id,
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
