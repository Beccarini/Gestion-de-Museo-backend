const express = require('express')
const { body, param, validationResult } = require('express-validator')
const { Op } = require('sequelize')
const { Integrante, Registro, Proyecto, Permiso, IntegranteProyecto, IntegrantePermiso } = require('../models')
const CARRERAS_VALIDAS = require('../constants/carreras')
const { getPaginacion, formatearDatosPaginados } = require('../utils/paginacion');
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
        .optional({ nullable: true })
        .isIn(CARRERAS_VALIDAS)
        .withMessage(`La carrera no es válida. Opciones: ${CARRERAS_VALIDAS.join(', ')}`),
    body('esActivo')
        .optional()
        .isBoolean().withMessage('esActivo debe ser un valor booleano (true o false)'),
    (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateIntegranteId = [
    param('id')
        .trim()
        .notEmpty().withMessage('El ID del integrante es obligatorio en la URL')
        .isUUID(4).withMessage('El formato del ID no es válido'),
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
        const {pagina, limite, offset} = getPaginacion(req, 10); 
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
        const data = await Integrante.findAndCountAll({
            where: integrantesWhere,
            order: [['nombre', 'ASC']],
            limit: limite,
            offset: offset
        });
        const response = formatearDatosPaginados(data, pagina, limite, 'integrantes');
        res.status(200).json(response);
    } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener los integrantes' })
  }
};

const getIntegranteById = async (req, res) => {
    try{
        const { id } = req.params
        const integrante = await Integrante.findByPk(id) 

        if(!integrante){
            return res.status(404).json({message: 'Integrante no encontrado'})
        }

        res.status(200).json(integrante)
    }catch(error){
        console.error(error)
        res.status(500).json({ error: 'Error al obtener el integrante' });
    }
}
const getProyectosByIntegrante = async (req, res) => {
    try {
        const { id } = req.params;
        const integrante = await Integrante.findByPk(id, {
            include: [{
                model: Proyecto,
                as: 'proyectos',
                through: { attributes: []}
            }]
        });

        if (!integrante) {
            return res.status(404).json({message: 'Integrante no encontrado' });
        }

        res.status(200).json({
            integrante,
            proyectos: integrante.Proyectos
    });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener proyectos del integrante' });
    }
}

const asignarProyecto = async (req, res) => {
    try {
        const { id } = req.params;
        const { proyectoId } = req.body;

        if (!proyectoId) {
            return res.status(400).json({ error: 'El campo proyectoId es obligatorio en el cuerpo de la solicitud' });
        }

        
        const integrante = await Integrante.findByPk(id);
        if (!integrante) {
            return res.status(404).json({ error: 'Integrante no encontrado' });
        }

        
        const proyecto = await Proyecto.findByPk(proyectoId);
        if (!proyecto) {
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        }

        
        const relacionExistente = await IntegranteProyecto.findOne({
            where: { integranteId: id, proyectoId }
        });

        if (relacionExistente) {
            return res.status(400).json({ error: 'El integrante ya está asignado a este proyecto' });
        }

        
        await IntegranteProyecto.create({
            integranteId: id,
            proyectoId
        });

        res.status(201).json({ msg: 'Proyecto asignado con éxito al integrante' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor al asignar el proyecto' });
    }
};


const desvincularProyecto = async (req, res) => {
    try {
        const { id, proyectoId } = req.params;

        
        const filasBorradas = await IntegranteProyecto.destroy({
            where: {
                integranteId: id,
                proyectoId
            }
        });

        if (filasBorradas === 0) {
            return res.status(404).json({ error: 'No se encontró la asignación entre este integrante y proyecto' });
        }

        res.status(200).json({ msg: 'Proyecto desvinculado con éxito del integrante' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor al desvincular el proyecto' });
    }
};

const getPermisosByIntegrante = async (req, res) => {
    try {
        const { id } = req.params;
        const integrante = await Integrante.findByPk(id, {
            include: [{
                model: Permiso,
                as: 'permisos',
                through: { attributes: [] }
            }]
        });

        if (!integrante) {
            return res.status(404).json({ message: 'Integrante no encontrado'});
        }

        res.status(200).json({
            integrante,
            permiso: integrante.Permiso
    });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener permisos del integrante'});
    }
}
const asignarPermiso = async (req, res) => {
    try {
        const { id } = req.params;
        const { permisoId } = req.body;

        if (!permisoId) {
            return res.status(400).json({ error: 'El campo permisoId es obligatorio en el cuerpo de la solicitud' });
        }

        
        const integrante = await Integrante.findByPk(id);
        if (!integrante) {
            return res.status(404).json({ error: 'Integrante no encontrado' });
        }

       
        const permiso = await Permiso.findByPk(permisoId);
        if (!permiso) {
            return res.status(404).json({ error: 'Perfil de permiso no encontrado' });
        }

        
        const relacionExistente = await IntegrantePermiso.findOne({
            where: { integranteId: id, permisoId }
        });

        if (relacionExistente) {
            return res.status(400).json({ error: 'Este perfil de acceso ya está asignado al integrante' });
        }

        
        await IntegrantePermiso.create({
            integranteId: id,
            permisoId
        });

        res.status(201).json({ msg: 'Perfil de acceso asignado con éxito al integrante' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor al asignar el permiso' });
    }
};


const desvincularPermiso = async (req, res) => {
    try {
        const { id, permisoId } = req.params;

        const filasBorradas = await IntegrantePermiso.destroy({
            where: {
                integranteId: id,
                permisoId
            }
        });

        if (filasBorradas === 0) {
            return res.status(404).json({ error: 'No se encontró esta asignación de regla de acceso para el integrante' });
        }

        res.status(200).json({ msg: 'Perfil de acceso revocado con éxito del integrante' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor al desvincular el permiso' });
    }
};

const getRegistrosByIntegrante = async (req, res) => {
    try{
        const { id } = req.params

        const {pagina, limite, offset } = getPaginacion(req, 10);

        const integrante = await Integrante.findByPk(id)
        if(!integrante){
            return res.status(404).json({ error: 'Integrante no encontrado' });
        }

        const data = await Registro.findAndCountAll({
            where: { integranteId: id},
            order: [['fecha', 'DESC']],
            limit: limite,
            offset
        });
        const registrosPaginados = formatearDatosPaginados(data, pagina, limite, 'historial');
        res.status(200).json({
            integrante,
            registrosPaginados
        });
    }catch(error){
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los registros del integrante' });
    }
}

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

const deleteIntegrante = async (req, res) => {
    try{
        const { id } = req.params
        const integrante = await Integrante.findByPk(id, {
            include: [{ model: Proyecto, as: 'proyectos' }]
        });

        if(!integrante){
            return res.status(404).json({message: 'Integrante no encontrado'})
        }
    
        if (integrante.proyectos && integrante.proyectos.length > 0) {
            return res.status(409).json({ 
                error: 'No se puede eliminar el integrante porque está asociado a uno o más proyectos.' 
            });
        }

        const tieneRegistros = await Registro.findOne({
            where: { integranteId: id }
        });

        if (tieneRegistros) {
            return res.status(409).json({ 
                error: 'No se puede eliminar el integrante porque tiene registros de asistencia asociados.' 
            });
        }

        await integrante.destroy()

        res.status(204).send()
    }catch(error){
        console.error(error)
        res.status(500).json({ error: 'Error al eliminar el integrante' });
    }
};


const toggleIntegranteEstado = async (req, res) => {
    try {
        const { id } = req.params;

        const integrante = await Integrante.findByPk(id);
        if (!integrante) {
            return res.status(404).json({ error: 'Integrante no encontrada' });
        }

        await integrante.update({ esActivo: !integrante.esActivo });

        res.status(200).json({ 
            msg: `Estado de integrante ${integrante.esActivo ? 'activado' : 'desactivado'} con éxito`,
            integrante 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al cambiar el estado del integrante' });
    }
};




router.get('/', getAllIntegrantes)
router.get('/:id', validateIntegranteId, getIntegranteById)
router.get('/:id/proyectos', validateIntegranteId, getProyectosByIntegrante);
router.post('/:id/proyectos', validateIntegranteId, asignarProyecto);
router.delete('/:id/proyectos/:proyectoId', validateIntegranteId, desvincularProyecto);
router.get('/:id/permisos', validateIntegranteId, getPermisosByIntegrante);
router.post('/:id/permisos', validateIntegranteId, asignarPermiso);
router.delete('/:id/permisos/:permisoId', validateIntegranteId, desvincularPermiso);
router.get('/:id/registros', validateIntegranteId, getRegistrosByIntegrante);
router.post('/', validateIntegranteData, addIntegrante)
router.put('/:id', ...validateIntegranteId, ...validateIntegranteData, updateIntegrante)
router.delete('/:id', validateIntegranteId, deleteIntegrante)
router.patch('/:id/toggle', validateIntegranteId, toggleIntegranteEstado)

module.exports = router;
