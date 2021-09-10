const fs = require('fs')
const { product } = require('../../models')

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
    return process.env.UPLOAD + '/products/' + image
}

const failed = (res, message, status) => {
    const responseCode = status ? status : 500
    const responseMessage = message ? message : 'Server Error'

    return res.status(responseCode).send({
        status: 'failed',
        message: responseMessage,
    })
}

//Get All Product
exports.getProducts = async (req, res) => {
    try {
        const query = {
            attributes: {
                exclude: ['createdAt', 'updatedAt'],
            },
        }
        const { limit, offset } = req.query

        if (limit) query.limit = parseInt(limit)
        if (offset) query.offset = parseInt(offset)

        const result = await product.findAll(query)

        result.filter((item) => (item.image = handleImage(item.image)))

        res.send({
            status: 'success',
            data: {
                products: result,
            },
        })
    } catch (error) {
        failed(res, 'Server Error')
    }
}

//Get Product By Id
exports.getProductByPk = async (req, res) => {
    try {
        const result = await product
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
                product: result,
            },
        })
    } catch (error) {
        failed(res)
    }
}

//Add Product
exports.addProduct = async (req, res) => {
    const error = validCheck(req.body)

    if (!req.body.title || !req.body.price || error) {
        fs.unlink('./uploads/products/' + req.file.filename, (err) => {
            if (err) {
                console.error(err)
            }
        })

        failed(res, 'No Data', 400)
    }

    try {
        const newProduct = await product
            .create({
                title: req.body.title,
                price: req.body.price,
                image: req.file.filename,
            })
            .catch((err) => failed(res, err, 500))

        res.status(200).send({
            status: 'success',
            data: {
                title: newProduct.title,
                price: newProduct.price,
                image: newProduct.image,
            },
        })
    } catch (error) {
        failed(res)
    }
}

//Update Product
exports.updateProduct = async (req, res) => {
    const { id } = req.params
    const item = {}

    if (req.body.image !== 'undefined') item.image = req.body.image
    if (req.body.title !== '') item.title = req.body.title
    if (req.body.price !== '') item.price = req.body.price

    if (req.file) {
        item.image = req.file.filename
        const { image } = await product.findOne({
            where: {
                id,
            },
            attributes: ['image'],
        })

        fs.unlink('./uploads/products/' + image, (err) => {
            if (err) {
                console.error(err)
            }
        })
    }

    try {
        await product.update(item, {
            where: {
                id,
            },
        })

        const data = await product.findOne({
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

//Delete Product Set Status to disabled
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params

        const data = await product.update(
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
