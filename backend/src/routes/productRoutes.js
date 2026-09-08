const express = require('express');
const productRouter = express.Router();
const {getAllProducts,
       getProductByID,
       createProduct,
       updateProduct,
       deleteProduct
} = require('../controllers/productController');


productRouter.get('/',getAllProducts).get('/:id',getProductByID);
productRouter.post('/',createProduct);
productRouter.put('/:id',updateProduct);
productRouter.delete('/:id',deleteProduct);

module.exports = productRouter;