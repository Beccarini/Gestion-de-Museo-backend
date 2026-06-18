const express = require('express');
const cors = require('cors');
const integrantesRouter = require('./routes/integrantes');
const recursosRouter=require('./routes/recursos');
const { sequelize, Integrante, Recurso, Item, Cambio } = require('./models');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3000;

app.use('/api/integrantes', integrantesRouter);
app.use('/api/recursos', recursosRouter);

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
