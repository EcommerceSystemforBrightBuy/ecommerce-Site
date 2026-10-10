const express = require('express');
const { getAllStaff, createStaff, updateStaff, deleteStaff } = require('../controllers/staffController');

const staffRoutes = express.Router();

staffRoutes.get('/', getAllStaff);
staffRoutes.post('/', createStaff);
staffRoutes.put('/:id', updateStaff);
staffRoutes.delete('/:id', deleteStaff);

module.exports = staffRoutes;
