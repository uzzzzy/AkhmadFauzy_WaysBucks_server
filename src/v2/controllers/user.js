const { models, success, failed } = require('../functions')

const { user: table } = models

exports.getUsers = async (req, res) => {
    let query = {
        distinct: true,
        attributes: {
            exclude: ['', 'createdAt', 'updatedAt'],
        },
    }

    try {
        const { status, order, limit, offset, type } = req.query
        let where = {}

        if (limit) query = { ...query, limit: parseInt(limit) }
        if (offset) query = { ...query, offset: parseInt(offset) }
        if (order) query = { ...query, order: [order.split(',')] }

        if (status) where = { ...where, status }

        query = { ...query, where }

        if (type === 'count') await table.count(query).then((data) => success(res, data))
        else
            await table.findAndCountAll(query).then(({ rows, count }) =>
                success(res, {
                    count,
                    users: rows,
                })
            )
    } catch (error) {
        failed(res)
    }
}
