const express = require('express');
const productRouter = express.Router();
const {getAllProducts,
       getProductByID,
       getProductwithReview,
       createProduct,
       updateProduct,
       deleteProduct,
       getAllProductswithVariants
} = require('../controllers/productController');

//For admin page
productRouter.get('/admin',getAllProductswithVariants);

productRouter.get('/',getAllProducts).get('/:id',getProductByID);
productRouter.get('/:id/review',getProductwithReview);
productRouter.post('/',createProduct);
productRouter.put('/:id',updateProduct);
productRouter.delete('/:id',deleteProduct);

module.exports = productRouter;