const path = require('path');
const { Sequelize } = require('sequelize');

// Use an in-memory database during tests, so each test run starts clean.
const sqliteStorage = process.env.NODE_ENV === 'test'
  ? ':memory:'
  : path.resolve(__dirname, '../../database.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: sqliteStorage,
  logging: false
});

const Category = require('./category')(sequelize);
const Product = require('./product')(sequelize);

// Define the relationships between models.
// Each Product can belong to an optional Category, and a Category can have many Products.
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// Export the Sequelize instance and models so other modules can access
// the database connection and model definitions from a single entry point.
module.exports = {
  sequelize,
  Category,
  Product
};
