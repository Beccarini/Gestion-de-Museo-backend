const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Product, Category } = require('../models');

const router = express.Router();

// Validation chain for product creation and update requests.
// We validate body fields here before reaching the controller logic.
const validateProductData = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required'),
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
  body('categoryId')
    .optional({ nullable: true })
    .isInt({ gt: 0 }).withMessage('Category id must be a positive integer'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Separate validation chain for route parameters.
// This handles productId in URLs and keeps parameter validation isolated
// from request body validation.
const validateProductId = [
  param('productId')
    .isInt({ gt: 0 }).withMessage('Product id must be a positive integer'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

const getAllProducts = async (req, res) => {
  const { name, category } = req.query;

  // Build filter conditions for optional query parameters.
  // Both name and category filters are optional: if they are omitted,
  // the endpoint returns all products. If provided, they narrow the
  // result set to matching product names and/or categories.
  const productWhere = {};
  if (name) {
    productWhere.name = {
      [Op.like]: `%${name}%`
    };
  }

  const categoryInclude = {
    model: Category,
    as: 'category',
    attributes: ['id', 'name'],
    required: false
  };

  if (category) {
    categoryInclude.where = {
      name: {
        [Op.like]: `%${category}%`
      }
    };
    categoryInclude.required = true;
  }

  const products = await Product.findAll({
    where: productWhere,
    include: categoryInclude
  });
  res.status(200).json(products);
};

const addProduct = async (req, res) => {
  const { name, price, categoryId } = req.body;

  if (categoryId) {
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(400).json({ message: 'Category not found' });
    }
  }

  const product = await Product.create({
    name,
    price,
    categoryId: categoryId || null
  });

  const productWithCategory = await Product.findByPk(product.id, {
    include: {
      model: Category,
      as: 'category',
      attributes: ['id', 'name']
    }
  });

  res.status(201).json(productWithCategory);
};

const updateProduct = async (req, res) => {
  const { productId } = req.params;
  const { name, price, categoryId } = req.body;

  const product = await Product.findByPk(productId);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  if (categoryId) {
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(400).json({ message: 'Category not found' });
    }
  }

  await product.update({
    name,
    price,
    categoryId: categoryId || null
  });

  const updatedProduct = await Product.findByPk(product.id, {
    include: {
      model: Category,
      as: 'category',
      attributes: ['id', 'name']
    }
  });

  res.status(200).json(updatedProduct);
};

const deleteProduct = async (req, res) => {
  const { productId } = req.params;
  const deletedCount = await Product.destroy({ where: { id: productId } });

  if (!deletedCount) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.status(204).send();
};

router.get('/', getAllProducts);
router.post('/', validateProductData, addProduct);
router.put('/:productId', [...validateProductId, ...validateProductData], updateProduct);
router.delete('/:productId', validateProductId, deleteProduct);

module.exports = router;
