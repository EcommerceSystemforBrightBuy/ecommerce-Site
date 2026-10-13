const express = require('express');
const productRouter = express.Router();
const {getAllProducts,
       getProductByID,
       createProduct,
       updateProduct,
       deleteProduct,
       getAllProductswithVariants,
       getProductReviews,
       addProductFeedback
} = require('../controllers/productController');

//For admin page
productRouter.get('/admin',getAllProductswithVariants);

productRouter.post('/feedback', addProductFeedback);
productRouter.get('/:id/reviews', getProductReviews);
productRouter.get('/',getAllProducts).get('/:id',getProductByID);
productRouter.post('/',createProduct);
productRouter.post('/:id/reviews',addProductFeedback);
productRouter.put('/:id',updateProduct);
productRouter.delete('/:id',deleteProduct);

module.exports = productRouter;
