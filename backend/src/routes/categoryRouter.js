const express = require('express');
const {getAllCategories} = require('../controllers/productController');

const categoryRouter = express.Router();

categoryRouter.get('/',getAllCategories);

module.exports = categoryRouter;