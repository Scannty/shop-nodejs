const path = require('path')

const express = require('express')
const { body } = require('express-validator')

const adminController = require('../controllers/admin')
const isAuth = require('../middleware/isAuth')

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct)

// /admin/products => GET
router.get('/products', adminController.getProducts)

// /admin/add-product => POST
router.post(
    '/add-product',
    isAuth,
    [
        body('title', 'Invalid title, must be at least 3 characters long').isString().isLength({ min: 3 }).trim(),
        body('price', 'Invalid price').isFloat(),
        body('description', 'Invalid description must be between 5 and 400 characters long').isLength({ min: 5, max: 400 }).trim()
    ],
    adminController.postAddProduct
)

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct)

router.post(
    '/edit-product',
    isAuth,
    [
        body('title', 'Invalid title, must be at least 3 characters long').isString().isLength({ min: 3 }).trim(),
        body('price', 'Invalid price').isFloat(),
        body('description', 'Invalid description must be between 5 and 400 characters long').isLength({ min: 5, max: 400 }).trim()
    ],
    adminController.postEditProduct
)

router.delete('/delete-product/:productId', isAuth, adminController.deleteProduct)

module.exports = router;
