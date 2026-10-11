const express = require('express');
const { register, login, adminLogin } = require('../controllers/authController');

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/admin-login', adminLogin);

module.exports = authRouter;
