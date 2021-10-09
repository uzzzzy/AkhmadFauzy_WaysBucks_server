const express = require('express')

const router = express.Router()

const path = require('path')

const { login } = require('../controllers/auth')
const { getUsers, getUserByPk } = require('../controllers/user')
const { getProducts, getProduct } = require('../controllers/product')
const { getToppings, getTopping } = require('../controllers/topping')
const { getTransactions } = require('../controllers/transaction')

const { authAdmin } = require('../middlewares/auth')

router.post('/login', login)

router.get('/users', authAdmin, getUsers)
router.get('/user/:id', authAdmin, getUserByPk)

router.get('/products', getProducts)
router.get('/product/:id', getProduct)

router.get('/toppings', getToppings)
router.get('/topping/:id', getTopping)

router.get('/transactions', getTransactions)

// Home Page
router.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/index.html'))
})

module.exports = router
