const { Sequelize, Op } = require('sequelize')

const { models, success, failed } = require('../functions')

const { product: table } = models

let query = {
    distinct: true,
    attributes: {
        exclude: ['', 'createdAt', 'updatedAt'],
    },
}

exports.getProducts = async (req, res) => {
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

        if (type === 'count') await table.count(query).then((data) => success(res, data))
        else
            await table.findAndCountAll(query).then(({ rows, count }) =>
                success(res, {
                    count,
                    products: rows,
                })
            )
    } catch (error) {
        console.log(error)
        failed(res)
    }
}

exports.getProduct = async (req, res) => {
    try {
        const { id } = req.params

        const product = await table.findByPk(id, query)

        success(res, product)
    } catch (error) {
        failed(res)
    }
}
