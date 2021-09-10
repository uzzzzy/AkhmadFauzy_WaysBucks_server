const fs = require('fs')
const { topping } = require('../../models')
const { validCheck, handleImage, failed } = require('../functions')

const imagepath = 'toppings'

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

        result.filter((item) => (item.image = item.image ? handleImage(item.image, imagepath) : null))

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
            .then((res) => ({ ...res.dataValues, image: res.image ? handleImage(res.image, imagepath) : null }))
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
