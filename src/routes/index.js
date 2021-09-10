const express = require('express')

const router = express.Router()

const { login, register, verifyToken } = require('../controllers/auth')
const { getUsers, deleteUser } = require('../controllers/user')

const { auth, authAdmin } = require('../middlewares/auth')

// auth route
router.post('/login', login)
router.post('/register', register)
router.post('/verify', auth, verifyToken)

// user route
router.get('/users', authAdmin, getUsers)
router.delete('/user/:id', auth, deleteUser)

module.exports = router
