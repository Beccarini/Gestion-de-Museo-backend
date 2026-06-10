const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../src/app');
const { sequelize } = require('../src/models');

chai.use(chaiHttp);
const { expect } = chai;

describe('API Integration Tests', () => {
  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });

  after(async () => {
    await sequelize.close();
  });

  describe('Category endpoints', () => {
    it('should create a category successfully', async () => {
      const res = await chai.request(app)
        .post('/api/categories')
        .send({ name: 'Electronics' });

      expect(res).to.have.status(201);
      expect(res.body).to.have.property('id');
      expect(res.body.name).to.equal('Electronics');
    });
  });

  describe('Product endpoints', () => {
    it('should create product and filter by product name', async () => {
      const categoryRes = await chai.request(app)
        .post('/api/categories')
        .send({ name: 'Home' });

      const categoryId = categoryRes.body.id;
      await chai.request(app)
        .post('/api/products')
        .send({ name: 'Couch', price: 499.99, categoryId });
      await chai.request(app)
        .post('/api/products')
        .send({ name: 'Table', price: 199.99, categoryId });

      const res = await chai.request(app)
        .get('/api/products')
        .query({ name: 'couch' });

      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array').that.has.length(1);
      expect(res.body[0].name).to.equal('Couch');
      expect(res.body[0].category.name).to.equal('Home');
    });

    it('should filter products by category name', async () => {
      const kitchenRes = await chai.request(app)
        .post('/api/categories')
        .send({ name: 'Kitchen' });
      const gardenRes = await chai.request(app)
        .post('/api/categories')
        .send({ name: 'Garden' });

      await chai.request(app)
        .post('/api/products')
        .send({ name: 'Knife Set', price: 59.99, categoryId: kitchenRes.body.id });
      await chai.request(app)
        .post('/api/products')
        .send({ name: 'Garden Hose', price: 29.99, categoryId: gardenRes.body.id });

      const res = await chai.request(app)
        .get('/api/products')
        .query({ category: 'Kitchen' });

      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array').that.has.length(1);
      expect(res.body[0].name).to.equal('Knife Set');
      expect(res.body[0].category.name).to.equal('Kitchen');
    });

    it('should return validation error when required fields are missing', async () => {
      let res;
      try {
        res = await chai.request(app)
          .post('/api/products')
          .send({ name: '', price: '' });
      } catch (err) {
        res = err.response;
      }

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('errors');
      expect(res.body.errors).to.be.an('array');
    });
  });
});
