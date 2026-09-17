const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const productRouter = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express(); //Stating the app with express
app.use(cors()); //For connecting backend with frontend url
app.use(express.json()); //enabling json format data transfer in api calls

const port = process.env.PORT || 8000;

app.use('/api/orders', orderRoutes)
app.use('/api/products', productRouter);

app.listen(port, () => {
    console.log("Server is running on port: ", port);
})