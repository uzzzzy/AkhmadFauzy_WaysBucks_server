const Joi = require('joi')

exports.validCheck = (body) => {
    let validator = {
        title: Joi.string().min(6).required(),
        price: Joi.number().integer(),
    }

    const schema = Joi.object(validator)

    const { error } = schema.validate(body)

    return error ? error : null
}

exports.handleImage = (image, path) => {
    return process.env.UPLOAD + `/${path}/` + image
}

exports.failed = (res, message, status) => {
    const responseCode = status ? status : 500
    const responseMessage = message ? message : 'Server Error'

    return res.status(responseCode).send({
        status: 'failed',
        message: responseMessage,
    })
}
