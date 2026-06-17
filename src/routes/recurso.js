const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const {Recurso, Cambio, Item}=require('../models');
const router = express.Router();
const validateDataRecurso=[
    body('nombre')
        .trim()
        .notEmpty().withMessage('El nombre es obligatorio'),
    body('descripcion')
        .trim()
        .notEmpty().withMessage('La descripción es obligatoria'),
    body('categoria')
        .trim()
        .notEmpty().withMessage('La categoría es obligatoria'),
    body('stock')
        .isInt({min: 0}).withMessage('El stock no puede ser negativo'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
]
const getAllRecursos=async(req,res)=>{
    try{
        const {nombre, categoria}=req.query;
        const whereRecurso={};
        if(nombre){
            whereRecurso.nombre={
                [Op.like]:`%${nombre}%`
            };
        }
        if(categoria){
            whereRecurso.categoria=categoria;
        }
        const recursos = await Recurso.findAll({
            where: whereRecurso,
            order: [['nombre', 'ASC']] 
        });
        res.status(200).json(recursos);
    }catch(error){
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los recursos'});
    }
}
const addRecurso = async (req, res) => {
    try{
        const nuevoRecurso = await Recurso.create(req.body);
        return res.status(201).json(nuevoRecurso);
    }catch{
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ 
                errors: [{ msg: 'Un valor ingresado único ya existe.' }] 
            });
        }
        return res.status(500).json({ error: 'Hubo un error interno en el servidor.' });
    }
}
router.get('/',getAllRecursos);
router.post('/',addRecurso);
module.exports = router;