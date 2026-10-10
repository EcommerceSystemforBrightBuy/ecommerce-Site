const express = require('express');
const productRouter = express.Router();
const {getAllProducts,
       getProductByID,
       getProductwithReview,
       createReview,
       createProduct,
       updateProduct,
       deleteProduct,
       getAllProductswithVariants
} = require('../controllers/productController');

//For admin page
productRouter.get('/admin',getAllProductswithVariants);

productRouter.get('/',getAllProducts).get('/:id',getProductByID);
productRouter.get('/:id/reviews',getProductwithReview);
productRouter.post('/',createProduct);
productRouter.post('/:id/reviews',createReview);
productRouter.put('/:id',updateProduct);
productRouter.delete('/:id',deleteProduct);

module.exports = productRouter;
