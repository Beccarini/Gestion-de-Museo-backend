# Simple Express example

A small Express REST API using Sequelize and SQLite, with category support,
request validation through express-validator, and CORS enabled for front-end
access.

To test run:

```
npm install
```

```
npm start
```

# How to test

List products
```
curl localhost:3000/api/products
```

Filter products by name
```
curl localhost:3000/api/products?name=Product
```

Filter products by category
```
curl localhost:3000/api/products?category=Electronics
```

Add new product
```
curl -X POST localhost:3000/api/products -H "Content-Type: application/json" --data '{"name": "Product 1", "price": 30}'
```

Add new category
```
curl -X POST localhost:3000/api/categories -H "Content-Type: application/json" --data '{"name": "Electronics"}'
```

Add new product with category
```
curl -X POST localhost:3000/api/products -H "Content-Type: application/json" --data '{"name": "TV", "price": 499.99, "categoryId": 1}'
```

List categories
```
curl localhost:3000/api/categories
```

Update product with id = 1
```
curl -X PUT localhost:3000/api/products/1 -H "Content-Type: application/json" --data '{"name": "Updated Product 1", "price": 60}'
```

Delete product with id = 1
```
curl -X DELETE localhost:3000/api/products/1
```
