const express = require('express')

const router = express.Router()

const path = require('path')
const { getTransactions } = require('../controllers/transaction')

router.get('/transactions', getTransactions)

// Home Page
router.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/index.html'))
})

module.exports = router
