module.exports = (req, res, next) => {
    
    const apiKey = req.header('x-api-key');
    
    const serverApiKey = process.env.ESCANER_API_KEY;

    if (!serverApiKey) {
        console.error('FATAL ERROR: ESCANER_API_KEY no está definido en el archivo .env');
        return res.status(500).json({ error: 'Error de configuración en el servidor' });
    }

    if (!apiKey || apiKey !== serverApiKey) {
        return res.status(401).json({ error: 'Acceso denegado. API Key de hardware inválida o faltante.' });
    }

    // Si coinciden, pasa
    next();
};