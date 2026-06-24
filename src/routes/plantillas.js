const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { Plantilla } = require('../models');

const router = express.Router();

const validatePlantillaData = [
    body('nombre')
        .trim()
        .notEmpty().withMessage('El nombre de la plantilla es obligatorio')
        .isLength({ max: 100 }).withMessage('El nombre no puede superar los 100 caracteres'),
    body('diaSemana')
        .notEmpty().withMessage('El día de la semana es obligatorio')
        .isInt({ min: 0, max: 6 }).withMessage('El día de la semana debe ser un número entre 0 (Domingo) y 6 (Sábado)'),
    body('horaInicio')
        .notEmpty().withMessage('La hora de inicio es obligatoria')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('La hora de inicio debe tener un formato HH:MM válido'),
    body('horaFin')
        .notEmpty().withMessage('La hora de fin es obligatoria')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('La hora de fin debe tener un formato HH:MM válido')
        .custom((value, { req }) => {
            if (value <= req.body.horaInicio) {
                throw new Error('La hora de fin debe ser posterior a la hora de inicio');
            }
            return true;
        }),
    body('frecuencia')
        .notEmpty().withMessage('La frecuencia es obligatoria')
        .isIn(['semanal', 'quincenal', 'mensual']).withMessage('La frecuencia debe ser: semanal, quincenal o mensual'),
    body('activo')
        .optional()
        .isBoolean().withMessage('El campo activo debe ser un booleano (true o false)'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validatePlantillaId = [
    param('id')
        .trim()
        .notEmpty().withMessage('El ID de la plantilla es obligatorio')
        .isUUID(4).withMessage('El formato del ID no es válido'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];


const getAllPlantillas = async (req, res) => {
    try {
        const plantillas = await Plantilla.findAll({
            order: [['diaSemana', 'ASC'], ['horaInicio', 'ASC']]
        });
        res.status(200).json(plantillas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las plantillas de horarios' });
    }
};

const getPlantillaById = async (req, res) => {
    try {
        const { id } = req.params;
        const plantilla = await Plantilla.findByPk(id);

        if (!plantilla) {
            return res.status(404).json({ error: 'Plantilla de horarios no encontrada' });
        }

        res.status(200).json(plantilla);
    } catch (error) {
        console.error('Error al obtener la plantilla por ID:', error);
        res.status(500).json({ error: 'Error interno al obtener la plantilla' });
    }
};

const getEventosByPlantilla = async (req, res) => {
    try {
        const { id } = req.params;

        const plantilla = await Plantilla.findByPk(id);
        if (!plantilla) {
            return res.status(404).json({ error: 'Plantilla de horarios no encontrada' });
        }

        const { Evento } = require('../models'); 
        const eventos = await Evento.findAll({
            where: { plantillaId: id },
            order: [['fechaInicio', 'DESC']] 
        });

        res.status(200).json({
            plantilla,
            eventos
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los eventos de la plantilla' });
    }
};

const addPlantilla = async (req, res) => {
    try {
        const { nombre, diaSemana, horaInicio, horaFin, frecuencia, activo } = req.body;

        const nuevoPlantilla = await Plantilla.create({
            nombre,
            diaSemana,
            horaInicio,
            horaFin,
            frecuencia,
            activo: activo !== undefined ? activo : true
        });

        res.status(201).json(nuevoPlantilla);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno al crear la plantilla de horarios' });
    }
};

const updatePlantilla = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, diaSemana, horaInicio, horaFin, frecuencia, activo } = req.body;

        const plantilla = await Plantilla.findByPk(id);
        if (!plantilla) {
            return res.status(404).json({ error: 'Plantilla de horarios no encontrada' });
        }

        await plantilla.update({ nombre, diaSemana, horaInicio, horaFin, frecuencia, activo });
        res.status(200).json(plantilla);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno al actualizar la plantilla' });
    }
};

const togglePlantillaEstado = async (req, res) => {
    try {
        const { id } = req.params;

        const plantilla = await Plantilla.findByPk(id);
        if (!plantilla) {
            return res.status(404).json({ error: 'Plantilla de horarios no encontrada' });
        }

        await plantilla.update({ activo: !plantilla.activo });

        res.status(200).json({ 
            msg: `Plantilla de plantilla ${plantilla.activo ? 'activada' : 'desactivada'} con éxito`,
            plantilla 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al cambiar el estado de la plantilla' });
    }
};

const deletePlantilla = async (req, res) => {
    try {
        const { id } = req.params;

        const plantilla = await Plantilla.findByPk(id);
        if (!plantilla) {
            return res.status(404).json({ error: 'Plantilla de horarios no encontrada' });
        }

        const { Evento } = require('../models'); 
        const tieneEventos = await Evento.findOne({
            where: { plantillaId: id }
        });

        if (tieneEventos) {
            return res.status(409).json({ 
                error: 'No se puede eliminar la plantilla porque tiene eventos asociados' 
            });
        }

        await plantilla.destroy();
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno al eliminar la plantilla' });
    }
};

router.get('/', getAllPlantillas);
router.get('/:id', ...validatePlantillaId, getPlantillaById); 
router.get('/:id/eventos', validatePlantillaId, getEventosByPlantilla);
router.post('/', validatePlantillaData, addPlantilla);
router.put('/:id', ...validatePlantillaId, ...validatePlantillaData, updatePlantilla);
router.patch('/:id/toggle', validatePlantillaId, togglePlantillaEstado); 
router.delete('/:id', validatePlantillaId, deletePlantilla);

module.exports = router;