const fs = require('fs')
const { user } = require('../../models')
const Joi = require('joi')

const failed = (res, message, status) => {
    const responseCode = status ? status : 500

    return res.status(responseCode).send({
        status: 'failed',
        message: message,
    })
}

exports.getUsers = async (req, res) => {
    try {
        const query = {
            attributes: {
                exclude: ['password', 'createdAt', 'updatedAt'],
            },
        }
        const { limit, offset, status } = req.query

        if (limit) query.limit = parseInt(limit)
        if (offset) query.offset = parseInt(offset)
        if (status) query.where = { status: status }

        const result = await user.findAll(query)

        res.send({
            status: 'success',
            data: {
                users: result,
            },
        })
    } catch (error) {
        return failed(res, 'Server Error')
    }
}

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params

        if (req.user.id !== parseInt(id) && req.user.role !== 'admin') return failed(res, 'Access Denied')

        await user.update(
            {
                status: 'disabled',
            },
            {
                where: { id },
            }
        )

        res.send({
            status: 'success',
            data: {
                id: id,
            },
        })
    } catch (error) {
        return failed(res, 'Server Error')
    }
}

exports.updateUser = async (req, res) => {
    const { fullName, email } = req.body

    if (fullName || email) {
        let validator = {}
        let body = {}

        if (email) {
            validator.email = Joi.string().email().min(6).required()
            body.email = email
        }
        if (fullName) {
            validator.fullName = Joi.string().min(1).required()
            body.fullName = fullName
        }

        const schema = Joi.object(validator)
        const { error } = schema.validate(body)

        if (error && req.file) {
            console.log(req.file.filename)
            fs.unlink('./uploads/users/' + req.file.filename, (err) => {
                if (err) {
                    console.error(err)
                }
            })
            console.log(error)

            return failed(res, 'No Data', 400)
        }
    }

    const id = req.user.id
    let message = 'Data Updated'
    if (email || fullName || req.file?.filename) {
        const image = req.file ? req.file.filename : undefined

        await user
            .findByPk(id, {
                attributes: ['image'],
            })
            .then((item) => {
                item.image &&
                    fs.unlink('./uploads/users/' + item.image, (err) => {
                        if (err) {
                            console.error(err)
                        }
                    })
            })
        let update = {}
        if (email) update.email = email
        if (fullName) update.fullName = fullName
        if (req.file.filename) update.image = req.file.filename

        await user.update(update, {
            where: {
                id,
            },
        })
    } else message = 'No Data Updated'
    return res.send({
        status: 'success',
        message: message,
    })
}
