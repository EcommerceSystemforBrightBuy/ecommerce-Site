const express = require('express');
const { getCustomer, updateCustomer } = require('../controllers/customerController');

const customerRouter = express.Router();

customerRouter.get('/:id', getCustomer);
customerRouter.put('/:id', updateCustomer);

module.exports = customerRouter;
