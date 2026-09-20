const express = require('express');
const escanerAuth = require('../middlewares/escanerAuth');
const { Integrante, Permiso } = require('../models');
const { Op } = require('sequelize');


const router = express.Router();


const getDatosDeAccesoEscaner = async (req, res) => {
    try {
        //obtener datos de UIDs de tarjetas
        //obtener permisos
        //realizar tabla conjunta
        //mandar tabla
        const integrantesDb = await Integrante.findAll({
            where: {
                esActivo: true,
                token: { [Op.ne]: null }
            },
            include: [{
                model: Permiso,
                as: 'permisos',
                through: { attributes: [] } // no trae las cosas de la tabla intermedia
            }]
        });

        const integrantesLigeros = integrantesDb.map(integrante => ({
            token: integrante.token,
            permisos: integrante.permisos.map(p => ({
                diaSemana: p.diasSemana,
                horaInicio: p.horaInicio,
                horaFin: p.horaFin
            }))
        }));


        res.status(200).json({
            fechaHoraServidod: new Date().toISOString(),
            integrantes: integrantesLigeros
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno al sincronizar datos con el escaner' });
    }
};


const registrarLoteAccesos = async (req, res) => {
    try {
  

        res.status(201).json({ msg: 'Endpoint POST de registros funcionando (Protegido)' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno al procesar el lote de registros' });
    }
};


router.get('/sync', escanerAuth, getDatosDeAccesoEscaner);
router.post('/registros', escanerAuth, registrarLoteAccesos);

module.exports = router;