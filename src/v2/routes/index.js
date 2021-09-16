const express = require('express')

const router = express.Router()

const path = require('path')

const { getUsers } = require('../controllers/user')
const { getProducts, getProduct } = require('../controllers/product')
const { getToppings, getTopping } = require('../controllers/topping')
const { getTransactions } = require('../controllers/transaction')

router.get('/users', getUsers)

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
