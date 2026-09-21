const express = require('express');
const escanerAuth = require('../middlewares/escanerAuth');
const { Integrante, Permiso, Evento, Registro } = require('../models');
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
            fechaHoraServidor: new Date().toISOString(),
            integrantes: integrantesLigeros
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno al sincronizar datos con el escaner' });
    }
};


const registrarLoteAccesos = async (req, res) => {
    try {
        const { lecturas } = req.body;

        if (!Array.isArray(lecturas)) {
            return res.status(400).json({ error: 'El formato esperado es un array en la propiedad de "lecturas"'});
        }

        const registrosCreados = [];

        for (const lectura of lecturas) {
            const { tokenLeido, fecha, esApertura } = lectura;
            const fechaLectura = new Date(fecha);

            if (!tokenLeido) {
                const nuevoRegistro = await Registro.create({
                    integranteId: null,
                    eentoId:null,
                    tokenLeido: 'DESCONOCIDO',
                    fecha: fechaLectura,
                    esAsistencia: false,
                    esApertura: esApertura || false,
                    mensajeError: esApertura
                        ? 'Error de firmware: Apertura ejecutada con tarjeta no registrada'
                        : 'Acceso denegado: Tarjeta no registrada'
                });
                registrosCreados.push(nuevoRegistro);
                continue;
            }

            const integrante = await Integrante.findOne({
                where: {token: tokenLeido, esActivo: true},
                attributes: ['id']
            });

            if (!integrante) continue;

            const eventoActual = await Evento.findOne({
                where: {
                    fechaInicio: { [Op.lte]: fechaLectura },
                    fechaFin: { [Op.gte]: fechaLectura }
                },
                attributes: ['id']
            });

            const nuevoRegistro = await Registro.create({
                integranteId: integrante.id,
                eventoId: eventoActual ? eventoActual.id : null,
                tokenLeido,
                fecha: fechaLectura,
                esAsistencia: eventoActual ? true : false,
                esApertura: esApertura || false,
                mensajeError: !esApertura ? 'Acceso denegado por hardware (Fuera de horario permitido)' : null
            });
            registrosCreados.push(nuevoRegistro);

        }
        res.status(201).json({ msg: `Lote procesado. Se guardaron ${registrosCreados.length} registros.` });
    } catch (error) {
        console.error('Error al procesar lote del escáner:', error);
        res.status(500).json({ error: 'Error interno al procesar el lote de lecturas' });
    }
};


router.get('/sync', escanerAuth, getDatosDeAccesoEscaner);
router.post('/registros', escanerAuth, registrarLoteAccesos);

module.exports = router;