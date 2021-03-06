const fs = require('fs')
const { topping: table } = require('../../../models')
const { validCheck, handleImage, failed } = require('../functions')

const imagepath = 'toppings'

//Get All Topping
exports.getToppings = async (req, res) => {
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
                toppings: rows,
            },
        })
    } catch (error) {
        return failed(res, 'Server Error')
    }
}

//Get Topping By Id
exports.getToppingByPk = async (req, res) => {
    try {
        const { status } = req.query
        const where = {}

        if (status) where.status = status

        const result = await table
            .findByPk(req.params.id, {
                where: where,
                attributes: {
                    exclude: ['createdAt', 'updatedAt'],
                },
            })
            .then((res) => ({ ...res.dataValues, image: res.image ? handleImage(res.image, imagepath) : null }))
            .catch(() => failed(res, 'Data Not Found', 400))

        res.send({
            status: 'succes',
            data: {
                topping: result,
            },
        })
    } catch (error) {
        return failed(res)
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

        return failed(res, 'No Data', 400)
    }

    try {
        const newTopping = await table
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
        return failed(res)
    }
}

//Update Topping
exports.updateTopping = async (req, res) => {
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

        fs.unlink('./uploads/toppings/' + image, (err) => {
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

//Delete Topping Set Status to disabled
exports.deleteTopping = async (req, res) => {
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
