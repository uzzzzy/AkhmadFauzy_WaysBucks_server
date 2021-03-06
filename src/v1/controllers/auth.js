const { user } = require('../../../models')

const Joi = require('joi')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const validCheck = (body, opt) => {
    let validator = {
        email: Joi.string().email().min(6).required(),
        password: Joi.string().min(6).required(),
    }
    if (opt === 'register') validator.fullName = Joi.string().min(1).required()

    const schema = Joi.object(validator)

    const { error } = schema.validate(body)

    return error ? error : null
}

const failed = (res, message, status) => {
    const responseCode = status ? status : 500

    return res.status(responseCode).send({
        status: 'failed',
        message: message,
    })
}

exports.login = async (req, res) => {
    const error = validCheck(req.body)
    if (error) {
        return failed(res, error.details[0].message, 400)
    }

    try {
        const userExist = await user.findOne({
            where: {
                email: req.body.email,
            },
        })

        if (!userExist) return failed(res, 'User Not Found')

        const isValid = await bcrypt.compare(req.body.password, userExist.password)

        if (!isValid) {
            return failed(res, 'Credential is Invalid', 400)
        }

        const token = jwt.sign({ id: userExist.id, role: userExist.status }, process.env.TOKEN)

        res.status(200).send({
            status: 'success',
            data: {
                fullName: userExist.fullName,
                email: userExist.email,
                image: userExist.image,
                status: userExist.status,
                token,
            },
        })
    } catch (error) {
        return failed(res, 'Server Error')
    }
}

exports.register = async (req, res) => {
    const error = validCheck(req.body, 'register')
    if (error) {
        return failed(res, error.details[0].message, 400)
    }

    const userExist = await user.findOne({
        where: {
            email: req.body.email,
        },
    })

    if (userExist) return failed(res, 'User Already Registered', 400)

    try {
        const salt = await bcrypt.genSalt(10)

        const hashedPassword = await bcrypt.hash(req.body.password, salt)

        const newUser = await user.create({
            fullName: req.body.fullName,
            email: req.body.email,
            password: hashedPassword,
            status: 'customer',
        })

        const token = jwt.sign(
            {
                id: newUser.id,
                role: newUser.status,
            },
            process.env.TOKEN
        )

        res.status(200).send({
            status: 'success',
            data: {
                fullName: newUser.fullName,
                token,
            },
        })
    } catch (error) {
        return failed(res, 'Server Error')
    }
}

exports.verifyToken = async (req, res) => {
    try {
        const result = await user.findByPk(req.user.id, {
            attributes: ['email', 'fullName', 'image', 'status'],
        })

        if (result.status === 'customer') result.image = result.image ? 'http://localhost:5000/uploads/users/' + result.image : 'http://localhost:5000/uploads/profile.jpg'
        else result.image = 'http://localhost:5000/uploads/admin.jpg'

        res.send({
            status: 'succes',
            data: {
                user: result,
            },
        })
    } catch (error) {
        return failed(res)
    }
}
