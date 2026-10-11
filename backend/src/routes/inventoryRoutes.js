const express = require('express');
const { getInventory, adjustStock } = require('../controllers/inventoryController');

const inventoryRoutes = express.Router();

inventoryRoutes.get('/', getInventory);
inventoryRoutes.put('/:sku', adjustStock);

module.exports = inventoryRoutes;
