const { Sequelize, Op } = require('sequelize')

const { models, success, failed } = require('../functions')

const { topping: table } = models

exports.getToppings = async (req, res) => {
    let query = {
        distinct: true,
        attributes: {
            exclude: ['createdAt', 'updatedAt'],
        },
    }

    try {
        const { status, title, order, limit, offset, type } = req.query

        if (limit) query = { ...query, limit: parseInt(limit) }
        if (offset) query = { ...query, offset: parseInt(offset) }
        if (order) query = { ...query, order: [order.split(',')] }

        let where = {}

        if (status) where = { ...where, status }
        if (title)
            where = {
                ...where,
                title: {
                    [Op.substring]: title,
                },
            }

        query = { ...query, where }

        if (type === 'count') {
            const count = await table.count(query)
            success(res, { count })
        } else {
            const { count, rows } = await table.findAndCountAll(query)
            success(res, {
                count: count,
                products: rows,
            })
        }
    } catch (error) {
        console.log(error)
        failed(res)
    }
}

exports.getTopping = async (req, res) => {
    let query = {
        distinct: true,
        attributes: {
            exclude: ['createdAt', 'updatedAt'],
        },
    }

    try {
        const { id } = req.params

        const product = await table.findByPk(id, query)

        success(res, product)
    } catch (error) {
        failed(res)
    }
}
