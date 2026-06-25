const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Permiso } = require('../models');
const { getPaginacion, formatearDatosPaginados } = require('../utils/paginacion');

const router = express.Router();

const DIAS_VALIDOS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const FORMATO_HORA_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

const validatePermisoData = [
    body('descripcion')
        .trim()
        .notEmpty().withMessage('La descripción del nivel de acceso es obligatoria'),
    body('diasSemana')
        .isArray({ min: 1 }).withMessage('diasSemana debe ser un arreglo con al menos un día'),
    body('diasSemana.*')
        .isIn(DIAS_VALIDOS)
        .withMessage(`Los días no son válidos. Opciones: ${DIAS_VALIDOS.join(', ')}`),
    body('horaInicio')
        .trim()
        .notEmpty().withMessage('La hora de inicio es obligatoria')
        .matches(FORMATO_HORA_REGEX).withMessage('La hora de inicio debe tener formato HH:mm'),
    body('horaFin')
        .trim()
        .notEmpty().withMessage('La hora de fin es obligatoria')
        .matches(FORMATO_HORA_REGEX).withMessage('La hora de fin debe tener formato HH:mm')
        .custom((value, { req }) => {
            if (req.body.horaInicio && value <= req.body.horaInicio) {
                throw new Error('La hora de fin debe ser posterior a la de inicio');
            }
            return true;
        }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validatePermisoId = [
    param('id')
        .trim()
        .notEmpty().withMessage('El ID del permiso es obligatorio en la URL')
        .isUUID(4).withMessage('El formato del ID no es válido'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const getAllPermisos = async (req, res) => {
    try {
        const { pagina, limite, offset } = getPaginacion(req, 10);
        const { diaSemana } = req.query;
        const permisosWhere = {};
        
        if (diaSemana) {
            permisosWhere.diasSemana = {
                [Op.like]: `%${diaSemana}%`
            };
        }

        const data = await Permiso.findAndCountAll({
            where: permisosWhere,
            order: [['horaInicio', 'ASC']],
            limit: limite,
            offset: offset
        });

        const response = formatearDatosPaginados(data, pagina, limite, 'permisos');
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los niveles de acceso' });
    }
};

const getPermisoById = async (req, res) => {
    try {
        const { id } = req.params;
        const permiso = await Permiso.findByPk(id);

        if (!permiso) {
            return res.status(404).json({ message: 'Nivel de acceso no encontrado' });
        }

        res.status(200).json(permiso);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el nivel de acceso' });
    }
};

const addPermiso = async (req, res) => {
    try {
        const { descripcion, diasSemana, horaInicio, horaFin } = req.body;

        const nuevoPermiso = await Permiso.create({
            descripcion,
            diasSemana,
            horaInicio,
            horaFin
        });
        
        return res.status(201).json(nuevoPermiso);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Hubo un error interno al crear el permiso.' });
    }
};

const updatePermiso = async (req, res) => {
    try {
        const { id } = req.params;
        const { descripcion, diasSemana, horaInicio, horaFin } = req.body;

        const permiso = await Permiso.findByPk(id);

        if (!permiso) {
            return res.status(404).json({ message: 'Nivel de acceso no encontrado' });
        }

        await permiso.update({
            descripcion,
            diasSemana,
            horaInicio,
            horaFin
        });

        res.status(200).json(permiso);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el nivel de acceso' });
    }
};

const deletePermiso = async (req, res) => {
    try {
        const { id } = req.params;
        const permiso = await Permiso.findByPk(id);

        if (!permiso) {
            return res.status(404).json({ message: 'Nivel de acceso no encontrado' });
        }

        await permiso.destroy();

        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el nivel de acceso' });
    }
};

router.get('/', getAllPermisos);
router.get('/:id', validatePermisoId, getPermisoById);
router.post('/', validatePermisoData, addPermiso);
router.put('/:id', ...validatePermisoId, ...validatePermisoData, updatePermiso);
router.delete('/:id', validatePermisoId, deletePermiso);

module.exports = router;