const TIPOS_EVENTO = ['clase', 'reunion', 'visita', 'mantenimiento', 'otro'];

const TIPOS_EVENTO_MENSAJE = `${TIPOS_EVENTO.slice(0, -1).join(', ')} u ${TIPOS_EVENTO[TIPOS_EVENTO.length - 1]}`;

module.exports = {
    TIPOS_EVENTO,
    TIPOS_EVENTO_MENSAJE
};