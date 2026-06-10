const express = require('express');
const cors = require('cors');
const productsRouter = require('./routes/products');
const categoriesRouter = require('./routes/categories');
const { sequelize } = require('./models');

const app = express();
app.use(cors());
const PORT = 3000;

app.use(express.json());
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);

// Start the HTTP server only when app.js is executed directly.
// This allows the app to be imported by tests without opening a listener.
const startServer = async () => {
  try {
    await sequelize.sync();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
