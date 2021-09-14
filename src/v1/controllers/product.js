const fs = require('fs')
const { product: table } = require('../../../models')
const { validCheck, handleImage, failed } = require('../functions')

const imagepath = 'products'

//Get All Product
exports.getProducts = async (req, res) => {
    try {
        const { limit, offset, status, order } = req.query

        const query = {
            attributes: {
                exclude: ['createdAt', 'updatedAt'],
            },
        }

        if (status) query.where = { status }
        if (limit) query.limit = parseInt(limit)
        if (offset) query.offset = parseInt(offset)
        if (order) query.order = [order.split(',')]

        const { count, rows } = await table.findAndCountAll(query)

        rows.filter((item) => (item.image = item.image ? handleImage(item.image, imagepath) : null))

        res.send({
            status: 'success',
            data: {
                count: count,
                products: rows,
            },
        })
    } catch (error) {
        return failed(res, 'Server Error')
    }
}

//Get Product By Id
exports.getProductByPk = async (req, res) => {
    try {
        const { status } = req.query
        const where = {}

        if (status) where.status = status

        const result = await table
            .findByPk(req.params.id, {
                where: {},
                attributes: {
                    exclude: ['createdAt', 'updatedAt'],
                },
            })
            .then((res) => ({ ...res.dataValues, image: res.image ? handleImage(res.image, imagepath) : null }))
            .catch(() => failed(res, 'Data Not Found', 400))

        res.send({
            status: 'succes',
            data: {
                product: result,
            },
        })
    } catch (error) {
        console.log(error)
        return failed(res)
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

        return failed(res, 'No Data', 400)
    }

    try {
        const newProduct = await table
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
        return failed(res)
    }
}

//Update Product
exports.updateProduct = async (req, res) => {
    const { id } = req.params
    const item = {}

    if (req.body.image !== 'undefined') item.image = req.body.image
    if (req.body.title !== '') item.title = req.body.title
    if (req.body.price !== '') item.price = req.body.price
    if (req.body.status !== '') item.status = req.body.status

    if (req.file) {
        item.image = req.file.filename
        const { image } = await table.findOne({
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
        await table.update(item, {
            where: {
                id,
            },
        })

        const data = await table.findOne({
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
        return failed(res)
    }
}

//Delete Product Set Status to disabled
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params

        const data = await table.update(
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
        return failed(res)
    }
}
