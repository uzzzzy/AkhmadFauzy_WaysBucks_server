exports.failed = (res, message, status) => {
    const responseCode = status ? status : 500
    const responseMessage = message ? message : 'Server Error'

    return res.status(responseCode).send({
        status: 'failed',
        message: responseMessage,
    })
}

exports.success = (res, data, status) => {
    const responseCode = status ? status : 200
    const responseData = data ? data : []

    return res.status(responseCode).send({
        status: 'success',
        data: responseData,
    })
}

exports.models = require('../../../models')
