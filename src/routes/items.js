const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { Recurso, Item } = require('../models');
const router = express.Router();
const ESTADO_RECURSOS = require('../constants/estadosRecurso');

const validateDataItem = [
    body('recursoId')
        .trim()
        .notEmpty().withMessage('El recursoId es obligatorio')
        .isUUID(4).withMessage('El ID no es válido'),
    body('cantidad')
        .isInt({ min: 0 }).withMessage('La cantidad no puede ser menor a 0'),
    body('estado')
        .trim()
        .notEmpty().withMessage('El estado es obligatorio')
        .isIn(ESTADO_RECURSOS).withMessage('Estado incorrecto'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        next();
    }
];

const validateItemID = [
    param('id')
        .trim()
        .notEmpty().withMessage('El ID es obligatorio en la URL')
        .isUUID(4).withMessage('ID no válido'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        next();
    }
];

const validateRecursoId = [
    param('recursoId')
        .trim()
        .notEmpty().withMessage('El ID del recurso es obligatorio')
        .isUUID(4).withMessage('El formato del ID del recurso no es válido'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        next();
    }
];

const getAllItems = async (req, res) => {
    try {
        const { estado } = req.query;
        const itemsWhere = {};
        if (estado) itemsWhere.estado = estado;
        const items = await Item.findAll({
            where: itemsWhere,
            order: [['estado', 'ASC']]
        });
        res.status(200).json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los items' });
    }
};

const getItemById = async (req, res) => {
    try {
        const item = await Item.findByPk(req.params.id, {
            include: [{ model: Recurso, as: 'recurso' }]
        });
        if (!item) return res.status(404).json({ message: 'Item no encontrado' });
        res.status(200).json(item);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el item' });
    }
};

const getItemsByRecurso = async (req, res) => {
    try {
        const recurso = await Recurso.findByPk(req.params.recursoId);
        if (!recurso) return res.status(404).json({ message: 'Recurso no encontrado' });
        const items = await Item.findAll({
            where: { recursoId: recurso.id },
            order: [['estado', 'ASC']]
        });
        res.status(200).json({ recurso, items });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener items del recurso' });
    }
};

const addItem = async (req, res) => {
    try {
        const { recursoId, cantidad, estado } = req.body;
        const recursoExiste = await Recurso.findByPk(recursoId);
        if (!recursoExiste) {
            return res.status(404).json({ message: 'Recurso asociado no encontrado' });
        }
        await Item.create({ recursoId, estado, cantidad });
        res.status(201).json({ message: 'Item creado correctamente' });
    } catch (error) {
        console.error(error);
        // 👇 Temporal para ver el error real
        res.status(500).json({ message: error.message, stack: error.stack });
    }
};
const updateItem = async (req, res) => {
    try {
        const item = await Item.findByPk(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item no encontrado' });
        const { cantidad, estado } = req.body;
        await item.update({ cantidad, estado });
        res.status(200).json({ message: 'Item actualizado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el item' });
    }
};

const deleteItem = async (req, res) => {
    try {
        const item = await Item.findByPk(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item a borrar no encontrado' });
        await item.destroy();
        // ✅ 204 sin body
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al borrar el ítem' });
    }
};

// ✅ Orden correcto: específica antes que paramétrica
router.get('/', getAllItems);
router.get('/recursos/:recursoId', validateRecursoId, getItemsByRecurso);
router.get('/:id', validateItemID, getItemById);
router.post('/', validateDataItem, addItem);
router.put('/:id', validateItemID, validateDataItem, updateItem);
router.delete('/:id', validateItemID, deleteItem);

module.exports = router;