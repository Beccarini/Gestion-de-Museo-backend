const express = require('express')
const { body, param, validationResult } = require('express-validator')
const { Op } = require('sequelize')
const { Integrante, Registro } = require('../models');

const router = express.Router();

const validateRegistroData = [
    body('integranteId')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isUUID(4).withMessage('El formato del ID no es válido'),
    body('tokenLeido')
        .trim()
        .notEmpty().withMessage('El token es obligatorio')
        .matches(/^[A-Fa-f0-9]+$/).withMessage('El token debe ser hexadecimal'),
    body('fecha')
        .notEmpty().withMessage('La fecha es obligatoria')
        .isISO8601().withMessage('La fecha debe estar en formato válido'),
    body('esAsistencia')
        .optional()
        .isBoolean().withMessage('esAsistencia debe ser un valor booleano (true o false)'),
    body('esApertura')
        .optional()
        .isBoolean().withMessage('esApertura debe ser un valor booleano (true o false)'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
]

const validateRegistroId = [
    param('id')
        .trim()
        .notEmpty().withMessage('El ID del registro es obligatorio en la URL')
        .isUUID(4).withMessage('El formato del ID no es válido'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateIntegranteId = [
    param('integranteId')
        .trim()
        .notEmpty().withMessage('El ID del integrante es obligatorio')
        .isUUID(4).withMessage('El formato del ID del integrante no es válido'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];  


const getAllRegistros = async (req, res) => {
    try {
        const { fechaInicio, fechaFin, esApertura, esAsistencia } = req.query;
        const registrosWhere = {};
        
        if (fechaInicio && fechaFin) {
            const inicio = fechaInicio.includes('T') 
                ? new Date(fechaInicio) 
                : new Date(`${fechaInicio}T00:00:00.000Z`);
                
            const fin = fechaFin.includes('T') 
                ? new Date(fechaFin) 
                : new Date(`${fechaFin}T23:59:59.999Z`);

            registrosWhere.fecha = {
                [Op.between]: [inicio, fin]
            };
        }else if (fechaInicio) {
            const inicioDia = fechaInicio.includes('T')
                ? new Date(fechaInicio)
                : new Date(`${fechaInicio}T00:00:00.000Z`);

            const finDia = fechaInicio.includes('T')
                ? new Date(fechaInicio)
                : new Date(`${fechaInicio}T23:59:59.999Z`);
            
            registrosWhere.fecha = {
                [Op.between]: [inicioDia, finDia]
            };
        }
        
        if (esApertura !== undefined) {
            registrosWhere.esApertura = esApertura === 'true';
        };

        if(esAsistencia != undefined){
            registrosWhere.esAsistencia = esAsistencia === 'true';
        };

        const registros = await Registro.findAll({
            where: registrosWhere,
            order: [['fecha', 'DESC']], 
            include: [{ model: Integrante, as: 'integrante' }]
        });

        res.status(200).json(registros)
    } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener los registros' })
  }
};

const getRegistroById = async (req, res) => {
    try{
        const { id } = req.params
        const registro = await Registro.findByPk(id, {
            include: [{ model: Integrante, as: 'integrante'}]
        })

        if(!registro){
            return res.status(404).json({message: 'Registro no encontrado'})
        }

        res.status(200).json(registro)

    }catch(error){
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el registro' });
    }
}

const getRegistrosByIntegrante = async (req, res) => {
    try{
        const { integranteId } = req.params

        const integrante = await Integrante.findByPk(integranteId)
        if(!integrante){
            return res.status(404).json({ error: 'Integrante no encontrado' });
        }

        const registros = await Registro.findAll({
            where: { integranteId },
            order: [['fecha', 'DESC']],
        });

        res.status(200).json({
            integrante,
            registros
        });
    }catch(error){
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los registros del integrante' });
    }
}

const addRegistro = async (req, res) => {
  try {
    let { 
      integranteId,    
      tokenLeido, 
      fecha,
      esApertura,
      esAsistencia,        
      mensajeError     
    } = req.body;

    if (esAsistencia && integranteId && !mensajeError) {
            
        const fechaRecibida = new Date(fecha);
        const inicioDia = new Date(fechaRecibida).setHours(0, 0, 0, 0); //cambiar a los de eventos
        const finDia = new Date(fechaRecibida).setHours(23, 59, 59, 999); //cambiar a los de eventos

        const asistenciaPrevia = await Registro.findOne({
            where: {
                integranteId,
                esAsistencia: true,
                mensajeError: null, 
                fecha: {
                    [Op.between]: [inicioDia, finDia]
                }
            }
        });

        if (asistenciaPrevia) {
            esAsistencia = false; 
        }
    }

    const nuevoRegistro = await Registro.create({
      integranteId,
      eventoId,
      tokenLeido,
      fecha,
      esAsistencia,
      esApertura,
      mensajeError
    });

    return res.status(201).json(nuevoRegistro);
  } catch (error) {
    console.error('Error al registrar evento desde ESP32:', error);
    return res.status(500).json({ error: 'Error interno al procesar el log' });
  }
};

const deleteRegistro = async (req, res) => {
    try {
        const { id } = req.params;

        const registro = await Registro.findByPk(id);

        if (!registro) {
            return res.status(404).json({ error: 'Registro no encontrado' });
        }

        await registro.destroy();

        res.status(200).json({ message: 'Registro eliminado con éxito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el registro' });
    }
};

router.get('/', getAllRegistros);
router.get('/:id', validateRegistroId, getRegistroById); 
router.get('/integrante/:integranteId', validateIntegranteId, getRegistrosByIntegrante); 
router.post('/', validateRegistroData, addRegistro);
router.delete('/:id', validateRegistroId, deleteRegistro)


module.exports = router;