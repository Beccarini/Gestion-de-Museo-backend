const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { Recurso, Cambio, Item } = require('../models');
const { getPaginacion, formatearDatosPaginados } = require('../utils/paginacion');
const router = express.Router();

const validateDataCambio = [
    body('cantidad')
        .isInt({ min: 1 }).withMessage('La cantidad no puede ser menor a 1'),
    body('fecha')
        .trim()
        .notEmpty().withMessage('La fecha es obligatoria')
        .isISO8601().withMessage('El formato de fecha debe ser válido (AAAA-MM-DD)')
        .toDate(),
    body('razon')
        .trim()
        .notEmpty().withMessage('Ingrese la razón del cambio'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateCambioId = [
    param('id')
        .trim()
        .notEmpty().withMessage('El ID del cambio es obligatorio en la URL')
        .isUUID(4).withMessage('El formato del ID no es válido (debe ser UUID)'),
    (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        next()
    }
];

const validateRecursoId = [
    param('id')
        .trim()
        .notEmpty().withMessage('El ID del recurso es obligatorio en la URL')
        .isUUID(4).withMessage('El formato del ID no es válido (debe ser UUID)'),
    (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        next()
    }
];

const addCambio = async (req, res) => {
    try {
        const { nombre, descripcion, tipo, fechaInicio, fechaFin, recursoId } = req.body;
        const nuevoEvento = await Evento.create({
            nombre,
            descripcion,
            tipo,
            fechaInicio,
            fechaFin,
            plantillaId: plantillaId || null     
        });

        res.status(201).json(nuevoEvento);
    } catch (error) {
        console.error('Error al crear el evento:', error);
        res.status(500).json({ error: 'Error interno al crear el evento' });
    }
};

const getCambioById = async (req, res) => {
    try {
        const { id } = req.params;
        const cambio = await Cambio.findByPk(id, {
            include: [
                { model: Recurso, attributes: ['id', 'nombre', 'stock'] },
                { model: Item, attributes: ['id', 'cantidad', 'estado'] }
            ]
        });

        if (!cambio) {
            return res.status(404).json({ error: 'Cambio no encontrado' });
        }

        res.status(200).json(cambio);
    } catch (error) {
        console.error('Error al obtener el cambio por ID:', error);
        res.status(500).json({ error: 'Error interno al obtener el cambio' });
    }
};
const getCambiosByRecurso = async (req, res) => {
    try {
        const { id } = req.params;
        const { pagina, limite, offset } = getPaginacion(req, 10);
        const recurso = await Recurso.findByPk(id);
        if (!recurso) {
            return res.status(404).json({ error: 'Recurso no encontrado' });
        }
        const data = await Cambio.findAndCountAll({
            where: { recursoId: id },
            order: [['fecha', 'DESC']],
            limit: limite,
            offset: offset
        });
        
        const registrosPaginados = formatearDatosPaginados(data, pagina, limite, 'cambios');
        
        res.status(200).json({
            recurso,
            registrosPaginados
        });
    } catch (error) {
        console.error('Error al obtener los cambios del recurso:', error);
        res.status(500).json({ error: 'Error interno al obtener los cambios del recurso' });
    }
};

router.get('/:id', validateCambioId, getCambioById);
router.get('/recurso/:id', validateRecursoId, getCambiosByRecurso);

module.exports = router;