const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const productRouter = require('./routes/productRoutes');
const categoryRouter = require('./routes/categoryRouter');
const orderRoutes = require('./routes/orderRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const staffRoutes = require('./routes/staffRoutes');
const reportRoutes = require('./routes/reportRoutes');
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const cartRoutes = require('./routes/cartRoutes');
const cityRoutes = require('./routes/cityRoutes');

const app = express(); 
app.use(cors()); 
app.use(express.json()); 

const port = process.env.PORT || 8000;

app.use('/api/products',productRouter);
app.use('/api/categories',categoryRouter);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/cities', cityRoutes);

app.listen(port, () => {
    console.log("Server is running on port: ", port);
})