const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const {Recurso, Cambio, Item}=require('../models');
const router = express.Router();
const validateDataCambio=[
    body('cantidad')
        .isInt({min: 1}).withMessage('La cantidad no puede ser menor a 1'),
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
]
module.exports = router;