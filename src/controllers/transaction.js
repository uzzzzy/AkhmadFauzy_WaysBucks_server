const fs = require('fs')
const { transaction: table, orderitem, product, topping } = require('../../models')
const { handleImage, failed, validCheck } = require('../functions')

const { Op } = require('sequelize')

exports.addTransaction = async (req, res) => {
    const { body } = req
    console.log(body)
    const error = validCheck(body, 'transaction')

    if (error) {
        fs.unlink('./uploads/transactions/' + req.file.filename, (err) => {
            if (err) {
                console.error(err)
            }
        })
        return failed(res, error.details[0].message, 400)
    }

    try {
        const { id } = await table
            .create({
                userId: req.user.id,
                status: 'waiting',
                fullName: req.body.fullName,
                email: req.body.email,
                phone: req.body.phone,
                poscode: req.body.poscode,
                address: req.body.address,
                attachment: req.file.filename,
            })
            .catch((err) => failed(res, err, 400))
        console.log(id)

        orderitem.update(
            {
                transactionDetailId: id,
            },
            {
                where: {
                    userId: req.user.id,
                    transactionDetailId: null,
                },
            }
        )

        return res.send({
            status: 'success',
            message: 'Wait for your order to be confirmed',
        })
    } catch (error) {
        failed(res)
    }
}

//get all transaction data
exports.getTransactions = async (req, res) => {
    try {
        const { id, role } = req.user //get user
        const { status, userId, order: orderBy } = req.query //get query

        const where = {}

        if (status) where.status = status
        if (userId) where.userId = role !== 'admin' ? id : userId
        const order = orderBy ? [orderBy.split(',')] : undefined

        const result = await table.findAll({
            where: where,
            attributes: {
                exclude: ['userId', 'createdAt', 'updatedAt'],
            },
            include: {
                model: orderitem,
                attributes: ['id'],
                include: [
                    {
                        model: product,
                        attributes: {
                            exclude: ['status', 'createdAt', 'updatedAt'],
                        },
                    },
                    {
                        model: topping,
                        attributes: ['id', 'title', 'price', 'image'],
                        through: {
                            attributes: [],
                        },
                    },
                ],
            },
            order,
        })

        return res.send({
            status: 'success',
            data: {
                transactions: result,
            },
        })
    } catch (error) {
        failed(res)
    }
}
