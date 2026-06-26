const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { Usuario } = require('../models');



//Validacion
const validateLogin = [
    body('email')
        .isEmail().withMessage('El email debe ser válido')
        .notEmpty().withMessage('El email es obligatorio'),
    body('password')
        .notEmpty().withMessage('La contraseña es obligatoria'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const usuario = await Usuario.findOne({ where: { email } });
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

        const seEncuentra = await usuario.validPassword(password);
        if (!seEncuentra) return res.status(401).json({ error: 'Contraseña incorrecta' });

        const token = jwt.sign(
            { id: usuario.id, email: usuario.email},
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        return res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error interno en el login' });
    }
};

router.post('/login', validateLogin, login);

module.exports = router;