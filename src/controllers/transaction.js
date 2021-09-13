const fs = require('fs')
const { transaction: table, orderitem, product, topping, user } = require('../../models')
const { handleImage, failed, validCheck } = require('../functions')

const { Op } = require('sequelize')
const { parse } = require('path')

//get all transaction data
exports.getTransactions = async (req, res) => {
    try {
        const { id, role } = req.user //get user
        const { status, userId, order: orderBy, attributes: attr, limit: limitQ, offset: offsetQ } = req.query //get query

        const attributes = attr ? attr.split(',') : undefined
        const where = {}

        if (status) where.status = status
        if (userId || role === 'customer') where.userId = role !== 'admin' ? id : userId
        const order = orderBy ? [orderBy.split(',')] : undefined

        console.log(order)

        let limit = limitQ ? parseInt(limitQ) : undefined
        let offset = offsetQ ? parseInt(offsetQ) : undefined

        const query = {
            where: where,
            limit,
            offset,
            attributes,
            distinct: true,
            include: {
                model: orderitem,
                attributes: ['id', 'qty'],
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
        }

        let result = []
        let count
        await table.findAndCountAll(query).then((res) => {
            count = res.count
            res.rows.forEach((trans, i) => {
                let total = 0
                trans.orderitems.forEach((item) => {
                    item.product.image = handleImage(item.product.image, 'products')
                    total += item.product.price
                    item.toppings.forEach((topping) => {
                        topping.image = handleImage(topping.image, 'toppings')
                        total += topping.price
                    })
                    total *= item.qty
                })
                result[i] = {
                    id: trans.id,
                    status: trans.status,
                    address: trans.address,
                    poscode: trans.poscode,
                    phone: trans.phone,
                    attachment: handleImage(trans.attachment, 'transactions'),
                    total: total + total * 0.1,
                    orderitems: trans.orderitems,
                }
            })
        })

        return res.send({
            status: 'success',
            data: {
                count,
                transactions: result,
            },
        })
    } catch (error) {
        console.log(error)
        failed(res)
    }
}

//get transaction by pk
exports.getTransaction = async (req, res) => {
    try {
        const { id, role } = req.user //get user
        const { status, userId, order: orderBy, attributes: attr, limit: limitQ, offset: offsetQ } = req.query //get query
        const { id: transactionId } = req.params

        const attributes = attr
            ? attr.split(',')
            : {
                  exclude: ['userId', 'createdAt', 'updatedAt'],
              }
        const where = {
            id: transactionId,
        }

        console.log(attributes)

        if (status) where.status = status
        if (userId || role === 'customer') where.userId = role !== 'admin' ? id : userId
        const order = orderBy ? [orderBy.split(',')] : undefined

        let limit = limitQ ? parseInt(limitQ) : undefined
        let offset = offsetQ ? parseInt(offsetQ) : undefined

        const query = {
            where: where,
            limit,
            offset,
            attributes,
            include: [
                {
                    model: user,
                    attributes: ['fullName', 'email'],
                },
                {
                    model: orderitem,
                    attributes: ['id', 'qty'],
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
            ],
            order,
        }

        let data = {}
        await table.findOne(query).then((trans) => {
            let total = 0
            trans.attachment = handleImage(trans.attachment, 'transactions')
            trans.orderitems = trans.orderitems.forEach((item) => {
                item.product.image = handleImage(item.product.image, 'products')
                total += item.product.price
                item.toppings.forEach((topping) => {
                    topping.image = handleImage(topping.image, 'toppings')
                    total += topping.price
                })
                total *= item.qty
            })
            data = { transaction: trans, total: total + total * 0.1 }
        })

        return res.send({
            status: 'success',
            data,
        })
    } catch (error) {
        failed(res)
    }
}

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
    } catch (error) {
        failed(res)
    }

    return res.send({
        status: 'success',
        message: 'Wait for your order to be confirmed',
    })
}

exports.updateTransaction = async (req, res) => {
    try {
        const { id, role } = req.params
        const { status } = req.body

        const query = {
            where: {
                id,
            },
        }
        await table.update(
            {
                status,
            },
            query
        )

        const message = status === 'approve' ? 'approved' : status === 'otw' ? 'send' : 'canceled'

        return res.send({
            status: 'success',
            message: 'order has been ' + message,
            status,
        })
    } catch (error) {
        failed(res)
    }
}
