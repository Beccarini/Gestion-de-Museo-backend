const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const {Recurso, Cambio, Item}=require('../models');
const router = express.Router();
const ESTADO_RECURSOS=require('../constants/estadosRecurso');
const validateDataItem=[
    body('cantidad')
        .isInt({min: 1}).withMessage('La cantidad no puede ser menor a 1'),
    body('estado')
        .trim()
        .notEmpty().withMessage('El estado debe ser obligatorio'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = router;