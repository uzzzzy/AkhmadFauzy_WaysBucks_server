const jwt = require('jsonwebtoken')

exports.auth = (req, res, next) => verify(req, res, next)

exports.authAdmin = (req, res, next) => verify(req, res, next, 'admin')

const verify = (req, res, next, roleOpt) => {
    const authHeader = req.header('Authorization')
    if (!authHeader) return res.status(401).send({ status: 'failed', message: 'No Token' })
    const token = authHeader.split(' ')[1]
    const role = roleOpt ? roleOpt : 'customer'

    if (!token) {
        return res.status(401).send({
            message: 'Access Denied',
            token: token,
        })
    }

    try {
        const verified = jwt.verify(token, process.env.TOKEN)
        if ((roleOpt && verified.role === role) || !roleOpt) {
            req.user = verified
            next()
        } else {
            res.status(401).send({ message: 'Access Denied' })
        }
    } catch (error) {
        console.log(error)
        res.status(400).send({ message: 'Invalid Token' })
    }
}
