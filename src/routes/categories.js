const express = require('express');
const { body, validationResult } = require('express-validator');
const { Category } = require('../models');

const router = express.Router();

// Category routes are simple, but we still validate the input body.
// We validate here because the POST endpoint needs a valid category name
// before trying to create the model in the database. This validator runs
// as middleware, so it intercepts the request, checks the body, and either
// returns an error response or passes control to the next handler.
const validateCategory = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

router.get('/', async (req, res) => {
  const categories = await Category.findAll();
  res.status(200).json(categories);
});

router.post('/', validateCategory, async (req, res) => {
  const category = await Category.create({ name: req.body.name });
  res.status(201).json(category);
});

module.exports = router;
