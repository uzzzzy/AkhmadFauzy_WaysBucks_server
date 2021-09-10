const fs = require('fs')
const { topping } = require('../../models')

const Joi = require('joi')

const validCheck = (body) => {
    let validator = {
        title: Joi.string().min(6).required(),
        price: Joi.number().integer(),
    }

    const schema = Joi.object(validator)

    const { error } = schema.validate(body)

    return error ? error : null
}

const handleImage = (image) => {
    return process.env.UPLOAD + '/toppings/' + image
}

const failed = (res, message, status) => {
    const responseCode = status ? status : 500
    const responseMessage = message ? message : 'Server Error'

    return res.status(responseCode).send({
        status: 'failed',
        message: responseMessage,
    })
}

//Get All Topping
exports.getToppings = async (req, res) => {
    try {
        const query = {
            attributes: {
                exclude: ['createdAt', 'updatedAt'],
            },
        }
        const { limit, offset } = req.query

        if (limit) query.limit = parseInt(limit)
        if (offset) query.offset = parseInt(offset)

        const result = await topping.findAll(query)

        result.filter((item) => (item.image = handleImage(item.image)))

        res.send({
            status: 'success',
            data: {
                toppings: result,
            },
        })
    } catch (error) {
        failed(res, 'Server Error')
    }
}

//Get Topping By Id
exports.getToppingByPk = async (req, res) => {
    try {
        const result = await topping
            .findByPk(req.params.id, {
                attributes: {
                    exclude: ['createdAt', 'updatedAt'],
                },
            })
            .then((res) => ({ ...res.dataValues, image: handleImage(res.image) }))
            .catch(failed(res, 'Data Not Found', 400))

        res.send({
            status: 'succes',
            data: {
                topping: result,
            },
        })
    } catch (error) {
        failed(res)
    }
}

//Add Topping
exports.addTopping = async (req, res) => {
    const error = validCheck(req.body)

    if (!req.body.title || !req.body.price || error) {
        fs.unlink('./uploads/toppings/' + req.file.filename, (err) => {
            if (err) {
                console.error(err)
            }
        })

        failed(res, 'No Data', 400)
    }

    try {
        const newTopping = await topping
            .create({
                title: req.body.title,
                price: req.body.price,
                image: req.file.filename,
            })
            .catch((err) => failed(res, err, 500))

        res.status(200).send({
            status: 'success',
            data: {
                title: newTopping.title,
                price: newTopping.price,
                image: newTopping.image,
            },
        })
    } catch (error) {
        failed(res)
    }
}

//Update Topping
exports.updateTopping = async (req, res) => {
    const { id } = req.params
    const item = {}

    if (req.body.image !== 'undefined') item.image = req.body.image
    if (req.body.title !== '') item.title = req.body.title
    if (req.body.price !== '') item.price = req.body.price

    if (req.file) {
        item.image = req.file.filename
        const { image } = await topping.findOne({
            where: {
                id,
            },
            attributes: ['image'],
        })

        fs.unlink('./uploads/toppings/' + image, (err) => {
            if (err) {
                console.error(err)
            }
        })
    }

    try {
        await topping.update(item, {
            where: {
                id,
            },
        })

        const data = await topping.findOne({
            where: { id },
            attributes: {
                exclude: ['createdAt', 'updatedAt'],
            },
        })

        res.status(200).send({
            status: 'success',
            data: {
                data,
            },
        })
    } catch (error) {
        failed(res)
    }
}

//Delete Topping Set Status to disabled
exports.deleteTopping = async (req, res) => {
    try {
        const { id } = req.params

        const data = await topping.update(
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
                id: data,
            },
        })
    } catch (error) {
        failed(res)
    }
}
