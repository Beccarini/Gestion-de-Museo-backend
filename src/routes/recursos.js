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
];
const validateRecursoId = [
    param('id')
        .trim()
        .notEmpty().withMessage('El ID del obligatorio es obligatorio en la URL')
        .isUUID(4).withMessage('El formato del ID no es válido'),
    (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        next();
    }
];
const getRecursoById=async(req,res)=>{
    try{
        const {id}=req.params;
        const recurso=await Recurso.findByPk(id);
        if(!recurso){
            return res.status(404).json({message:'Recurso no encontrado'});
        }
        res.status(200).json(recurso);
    }catch(error){
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el recurso'});
    };
};
const getAllRecursos=async(req,res)=>{
    try{
        const {nombre, categoria, stock}=req.query;
        const whereRecurso={};
        if(nombre){
            whereRecurso.nombre={
                [Op.like]:`%${nombre}%`
            };
        };
        if(categoria){
            whereRecurso.categoria=categoria;
        };
        const recursos = await Recurso.findAll({
            where: whereRecurso,
            order: [['nombre', 'ASC']] 
        });
        res.status(200).json(recursos);
    }catch(error){
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los recursos'});
    };
};
const addRecurso = async (req, res) => {
    try{
        const nuevoRecurso = await Recurso.create(req.body);
        return res.status(201).json(nuevoRecurso);
    }catch(error){
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ 
                errors: [{ msg: 'Un valor ingresado único ya existe.' }] 
            });
        };
        console.error(error);
        return res.status(500).json({ error: 'Hubo un error interno en el servidor.' });
    }
}
const updateRecurso=async(req,res)=>{
    try{
        const recurso = await Recurso.findByPk(req.params.id);
        const { nombre, descripcion, categoria, stock } = req.body;
        if(!recurso){
            return res.status(404).json({ message: 'Recurso no encontrado' });
        };
        await recurso.update({
            nombre,
            descripcion,
            categoria,
            stock
        });
        return res.status(200).json(recurso);
    }catch(error){
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el recurso'});
    }
}
const deleteRecurso=async(req,res)=>{
    try{
        const recurso = await Recurso.findByPk(req.params.id);
        if(!recurso){
            return res.status(404).json({ message: 'Recurso no encontrado' });
        }
        await recurso.destroy();
        return res.status(204).json(recurso);
    }catch(error){
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el recurso'});
    }
}
router.get('/',getAllRecursos);
router.get('/:id',validateRecursoId,getRecursoById);
router.post('/',validateDataRecurso,addRecurso);
router.put('/:id',validateRecursoId,validateDataRecurso,updateRecurso);
router.delete('/:id', validateRecursoId, deleteRecurso);
module.exports = router;