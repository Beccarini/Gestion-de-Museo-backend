const express = require('express')
const { body, param, validationResult } = require('express-validator')
const { Op } = require('sequelize')
const { Integrante, Registro } = require('../models')
const CARRERAS_VALIDAS = require('../constants/carreras')


const router = express.Router();

const validateIntegranteData = [
    body('nombre')
        .trim()
        .notEmpty().withMessage('El nombre es obligatorio'),
    body('legajo')
        .trim()
        .notEmpty().withMessage('El legajo es obligatorio'),
    body('token')
        .optional({ nullable: true })
        .trim(),
    body('carrera')
        .optional({ nullable: true }) // Soporta que sea null si es personal externo
        .isIn(CARRERAS_VALIDAS)
        .withMessage(`La carrera no es válida. Opciones: ${CARRERAS_VALIDAS.join(', ')}`),
    body('esActivo')
        .optional()
        .isBoolean().withMessage('esActivo debe ser un valor booleano (true o false)'),
    (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    next();
  }
];

const validateIntegranteId = [
    param('id')
        .trim()
        .notEmpty().withMessage('El ID del integrante es obligatorio en la URL'),
    (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        next()
    }
];

const getAllIntegrantes = async (req, res) => {
    try {
        const { nombre, carrera } = req.query
        const integrantesWhere = {}
        if (nombre) {
            integrantesWhere.nombre = {
                [Op.like]: `%${nombre}%`
        };
        }
        if (carrera) {
            integrantesWhere.carrera = carrera;
        }

        const integrantes = await Integrante.findAll({
        where: integrantesWhere,
        order: [['nombre', 'ASC']] 
        });
        res.status(200).json(integrantes)
    } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener los integrantes' })
  }
};

const addIntegrante = async (req, res) => {
    try{
        const nuevoIntegrante = await Integrante.create(req.body)
        return res.status(201).json(nuevoIntegrante)
    }catch(error){
        console.error(error)
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ 
                errors: [{ msg: 'Ya existe un integrante registrado con ese número de legajo.' }] 
        });
    }
    return res.status(500).json({ error: 'Hubo un error interno en el servidor.' })
    }
}

const updateIntegrante = async (req, res) => {
    try{
        const { id } = req.params
        const { nombre, legajo, token, carrera, esActivo } = req.body

        const integrante = await Integrante.findByPk(id)

        if(!integrante){
            return res.status(404).json({message: 'Integrante no encontrado'})
        }

        await integrante.update({
            nombre,
            legajo,
            token,
            carrera,
            esActivo
        })

        res.status(200).json(integrante)
    }catch(error){
        console.error(error)
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ 
                errors: [{ msg: 'Ya existe otro integrante registrado con ese número de legajo.' }] 
            })
        }
        res.status(500).json({ error: 'Error al actualizar el integrante' })
    }
}

router.get('/', getAllIntegrantes)
router.post('/', validateIntegranteData, addIntegrante)
router.put('/:id', [validateIntegranteId, validateIntegranteData], updateIntegrante)


module.exports = router;