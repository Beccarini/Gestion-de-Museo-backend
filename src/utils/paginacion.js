/**
 * Genera el objeto de paginación para Sequelize y la respuesta del frontend.
 * @param {Object} req - Objeto Request de Express
 * @param {number} defaultLimit - Límite por defecto si no se envía en la URL
 */
const getPaginacion = (req, limitePorDefecto = 10) => {
    
    const pagina = parseInt(req.query.pagina || req.query.page, 10) || 1;
    const limite = parseInt(req.query.limite || req.query.limit, 10) || limitePorDefecto;
    const offset = (pagina - 1) * limite;

    return { pagina, limite, offset };
};

/**
 * Formatea los datos devueltos por findAndCountAll para el frontend.
 * @param {Object} data - El resultado de { count, rows } de Sequelize
 * @param {number} page - Página actual
 * @param {number} limit - Límite de elementos por página
 * @param {string} dataKey - Nombre de la propiedad donde irán los registros (ej: 'integrantes')
 */
const formatearDatosPaginados = (data, pagina, limit, nombreClave) => {
    const { count, rows } = data;
    const totalPaginas = Math.ceil(count / limit);

    return {
        totalElementos: count,
        totalPaginas: totalPaginas,
        paginaActual: pagina,
        [nombreClave]: rows //dataKey muestra, por ejemplo, "proyectos" o "integrantes" dependiendo del contexto
    };
};

module.exports = {
    getPaginacion,
    formatearDatosPaginados
};