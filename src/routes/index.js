const express = require('express')

const router = express.Router()

const { login, register, verifyToken } = require('../controllers/auth')
const { getUsers, deleteUser } = require('../controllers/user')
const { getProducts, getProductByPk, addProduct, updateProduct, deleteProduct } = require('../controllers/product')
const { getToppings, getToppingByPk, addTopping, updateTopping, deleteTopping } = require('../controllers/topping')

const { auth, authAdmin } = require('../middlewares/auth')
const { uploadFile, updateFile } = require('../middlewares/upload')

// auth route
router.post('/login', login)
router.post('/register', register)
router.post('/verify', auth, verifyToken)

// user route
router.get('/users', authAdmin, getUsers)
router.delete('/user/:id', auth, deleteUser)

// product route
router.get('/products', getProducts)
router.get('/product/:id', getProductByPk)
router.post('/product', authAdmin, uploadFile('image'), addProduct)
router.patch('/product/:id', authAdmin, updateFile('image'), updateProduct)
router.delete('/product/:id', authAdmin, deleteProduct)

// topping route

router.get('/toppings', getToppings)
router.get('/topping/:id', getToppingByPk)
router.post('/topping', authAdmin, uploadFile('image'), addTopping)
router.patch('/topping/:id', authAdmin, updateFile('image'), updateTopping)
router.delete('/topping/:id', authAdmin, deleteTopping)

module.exports = router
