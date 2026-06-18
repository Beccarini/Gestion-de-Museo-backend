const express = require('express')
const { body, param, query, validationResult } = require('express-validator')
const { Op } = require('sequelize')
const { Evento } = require('../models');

const router = express.Router();

const validateEventoData = [
    body('nombre')
        .trim()
        .notEmpty().withMessage('El nombre del evento es obligatorio')
        .isLength({ max: 100 }).withMessage('El nombre no puede superar los 100 caracteres'),
    body('fechaInicio')
        .notEmpty().withMessage('La fecha de inicio es obligatoria')
        .isISO8601().withMessage('La fecha de inicio debe tener un formato ISO8601 válido'),
    body('fechaFin')
        .notEmpty().withMessage('La fecha de fin es obligatoria')
        .isISO8601().withMessage('La fecha de fin debe tener un formato ISO8601 válido')
        .custom((value, { req }) => {
            if (new Date(value) <= new Date(req.body.fechaInicio)) {
                throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
            }
            return true;
        }),
    
    body('esRecurrente')
        .optional()
        .isBoolean().withMessage('esRecurrente debe ser un valor booleano (true o false)'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateEventoQuery = [
    query('fechaInicio')
        .optional()
        .isISO8601().withMessage('El parámetro fechaInicio debe ser una fecha válida'),
    
    query('fechaFin')
        .optional()
        .isISO8601().withMessage('El parámetro fechaFin debe ser una fecha válida'),
        
    query('esRecurrente')
        .optional()
        .isBoolean().withMessage('El parámetro esRecurrente debe ser true o false'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateEventoId = [
    param('id')
        .trim()
        .notEmpty().withMessage('El ID del evento es obligatorio en la URL')
        .isUUID(4).withMessage('El formato del ID no es válido'),
    (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        next()
    }
];

const getAllEventos = async (req, res) => {
    try {
        const { fechaInicio, fechaFin, esRecurrente } = req.query;
        const eventosWhere = {};

        if (fechaInicio && fechaFin) {
            const inicio = fechaInicio.includes('T') 
                ? new Date(fechaInicio) 
                : new Date(`${fechaInicio}T00:00:00.000Z`);
                
            const fin = fechaFin.includes('T') 
                ? new Date(fechaFin) 
                : new Date(`${fechaFin}T23:59:59.999Z`);

            eventosWhere.fechaInicio = {
                [Op.between]: [inicio, fin]
            };
        } else if (fechaInicio) {
            const inicioDia = fechaInicio.includes('T')
                ? new Date(fechaInicio)
                : new Date(`${fechaInicio}T00:00:00.000Z`);

            const finDia = fechaInicio.includes('T')
                ? new Date(fechaInicio)
                : new Date(`${fechaInicio}T23:59:59.999Z`);
            
            eventosWhere.fechaInicio = {
                [Op.between]: [inicioDia, finDia]
            };
        }

        if (esRecurrente !== undefined) {
            eventosWhere.esRecurrente = esRecurrente === 'true';
        }

        const eventos = await Evento.findAll({
            where: eventosWhere,
            order: [['fechaInicio', 'ASC']] 
        });
        res.status(200).json(eventos)
    } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener los eventos' })
  }
}

const getEventoById = async (req, res) => {
    try {
        const { id } = req.params;
        const evento = await Evento.findByPk(id);

        if (!evento) {
            return res.status(404).json({ error: 'Evento no encontrado' });
        }

        res.status(200).json(evento);
    } catch (error) {
        console.error('Error al obtener el evento por ID:', error);
        res.status(500).json({ error: 'Error interno al obtener el evento' });
    }
};

const getEventosHoy = async (req, res) => {
    try {
        const inicioDia = new Date();
        inicioDia.setHours(0, 0, 0, 0);

        const finDia = new Date();
        finDia.setHours(23, 59, 59, 999);

        const eventos = await Evento.findAll({
            where: {
                fechaInicio: {
                    [Op.between]: [inicioDia, finDia]
                }
            },
            attributes: ['id', 'nombre', 'fechaInicio', 'fechaFin', 'esRecurrente'],
            order: [['fechaInicio', 'ASC']]
        });

        res.status(200).json(eventos);
    } catch (error) {
        console.error('Error al obtener los eventos de hoy:', error);
        res.status(500).json({ error: 'Error interno al obtener los eventos de hoy' });
    }
};

const addEvento = async (req, res) => {
    try {
        const { nombre, fechaInicio, fechaFin, esRecurrente } = req.body;

        const nuevoEvento = await Evento.create({
            nombre,
            fechaInicio,
            fechaFin,
            esRecurrente: esRecurrente || false
        });

        res.status(201).json(nuevoEvento);
    } catch (error) {
        console.error('Error al crear el evento:', error);
        res.status(500).json({ error: 'Error interno al crear el evento' });
    }
};

const updateEvento = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, fechaInicio, fechaFin, esRecurrente } = req.body;

        const evento = await Evento.findByPk(id);
        if (!evento) {
            return res.status(404).json({ error: 'Evento no encontrado' });
        }

        await evento.update({
            nombre,
            fechaInicio,
            fechaFin,
            esRecurrente
        }); 

        res.status(200).json(evento);
    } catch (error) {
        console.error('Error al actualizar el evento:', error);
        res.status(500).json({ error: 'Error interno al actualizar el evento' });
    }
};

router.get('/', validateEventoQuery, getAllEventos);
router.get('/hoy',getEventosHoy);
router.get('/:id',validateEventoId ,getEventoById);
router.post('/', validateEventoData, addEvento)
router.put('/:id', ...validateEventoId, ...validateEventoData, updateEvento)

module.exports = router;