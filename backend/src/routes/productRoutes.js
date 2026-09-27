const express = require('express');
const productRouter = express.Router();
const {getAllProducts,
       getProductByID,
       createProduct,
       updateProduct,
       deleteProduct,
       getAllProductswithVariants
} = require('../controllers/productController');

//For admin page
productRouter.get('/admin',getAllProductswithVariants);

productRouter.get('/',getAllProducts).get('/:id',getProductByID);
productRouter.post('/',createProduct);
productRouter.put('/:id',updateProduct);
productRouter.delete('/:id',deleteProduct);

module.exports = productRouter;