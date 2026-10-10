const express = require('express');
const {
    getCart,
    addItem,
    setItemQuantity,
    removeItem,
    clearCart,
    syncCart,
} = require('../controllers/cartController');

const cartRouter = express.Router();

// Fixed paths first, then the ones with :params
cartRouter.post('/items', addItem);
cartRouter.put('/items', setItemQuantity);
cartRouter.post('/sync', syncCart);

cartRouter.get('/:customerId', getCart);
cartRouter.delete('/:customerId/items/:variantId', removeItem);
cartRouter.delete('/:customerId', clearCart);

module.exports = cartRouter;
