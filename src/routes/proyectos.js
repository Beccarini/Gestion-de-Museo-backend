const express = require('express')
const { body, param, validationResult } = require('express-validator')
const { Op } = require('sequelize')
const { Integrante, Registro, Proyecto } = require('../models')
const ESTADOS_PROYECTO = require('..constants/estados/estadosProyecto');


const router = express.Router();

const validateProyectoData = [
    body('nombre')
        .trim()
        .notEmpty().withMessage('El nombre del proyecto es obligatorio'),
        body('descripcion')
            .optional({ nullable: true })
            .trim(),
        body('fechaInicio')
            .optional({ nullable: true })
            .isISO8601().withMessage('La fecha de inicio debe tener un formato de fecha válido (YYYY-MM-DD)'),
        body('fechaFin')
            .optional({ nullable: true })
            .isISO8601().withMessage('La fecha de fin debe tener un formato de fecha válido (YYYY-MM-DD)')
            .custom((value, { req }) => {
                if (req.body.fechaInicio && value < req.body.fechaInicio) {
                    throw new Error('La fecha de fin no puede ser anterior a la fecha de inicio');
                }
                return true;
            }),
        body('estado')
            .trim()
            .notEmpty().withMessage('El estado no puede estar vacío si se proporciona')
            .inIn(ESTADO_PROYECTO)
            .withMessage(`El estado no es válido. Opciones: ${ESTADO_PROYECTO.join(', ')}`),
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
        next();
    }
];  


const validateProyectoId = [
    param('id')
        .trim()
        .notEmpty().withMessage('El ID del proyecto es obligatorio en la URL')
        .isUUID(4).withMessage('El formato del ID no es válido'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];



const getAllProyectos = async (req, res) => {
    try {
        const { nombre, estado } = req.query;
        const proyectosWhere = {};
        
        //Filtros
        if (nombre) {
            proyectosWhere.nombre = {
                [Op.like]: `%${nombre}%`
            };
        }
        if (estado) {
            proyectosWhere.estado = estado;
        }

        const proyectos = await Proyecto.findAll({
            where: proyectosWhere,
            order: [['nombre', 'ASC']]
        });

        res.status(200).json(proyectos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los proyectos' });
    }
};

const getProyectoById = async (req, res) => {
    try {
        const { id } = req.params;
        const proyecto = await Proyecto.findByPk(id);

        if(!proyecto) {
            return res.status(404).json({message: 'Proyecto no encontrado' });
        }

        res.status(200).json(proyecto);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el proyecto'});
    }
};

const addProyecto = async (req, res) => {
    try {
        const { nombre, descripcion, fechaInicio, fechaFin, estado } = req.body;

        
        const nuevoProyecto = await Proyecto.create({
            nombre,
            descripcion,
            fechaInicio,
            fechaFin,
            estado
        });
        return res.status(201).json(nuevoProyecto);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Hubo un error interno en el servidor.' });
    }
};

const updateProyecto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, fechaInicio, fechaFin, estado } = req.body;

        const proyecto = await Proyecto.findByPk(id);

        if (!proyecto) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }

        await proyecto.update({
            nombre,
            descripcion,
            fechaInicio,
            fechaFin,
            estado
        });

        res.status(200).json(proyecto);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el proyecto' });
    }
};

const deleteProyecto = async (req, res) => {
    try {
        const { id } = req.params;
        const proyecto = await Proyecto.findByPk(id);

        if (!proyecto) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }

        await proyecto.destroy();

        res.status(204).send();
    } catch (error) {
        console.error(error);   
        res.status(500).json({ error: 'Error al eliminar el proyecto'});
    }
};


router.get('/', getAllProyectos);
router.get('/:id', validateProyectoId, getProyectoById);
router.post('/', validateProyectoData, addProyecto);
router.put('/:id', ...validateProyectoId, ...validateProyectoData, updateProyecto);
router.delete('/:id', validateProyectoId, deleteProyecto);

