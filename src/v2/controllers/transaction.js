const { Sequelize } = require('sequelize')
const { success, models, failed } = require('../functions')

const { transaction: table, user, orderitem, product } = models

exports.getTransactions = async (req, res) => {
    const { status: qStatus } = req.query

    const status = qStatus ? qStatus : undefined

    const where = {}

    try {
        // const result = await table.findAndCountAll({
        //     attributes: [
        //         'id',
        //         'userId',
        //         'status',
        //         'fullName',
        //         'email',
        //         'status', // We had to list all attributes...
        //     ],
        //     group: ['status'], //count column entity
        //     distinct: true,
        //     include: [
        //         {
        //             model: user,
        //             attributes: ['id'],
        //         },
        //         {
        //             model: orderitem,
        //             attributes: ['id'],
        //             include: [
        //                 {
        //                     model: product,
        //                     attributes: {
        //                         exclude: ['createdAt', 'updatedAt'],
        //                     },
        //                 },
        //             ],
        //         },
        //     ],
        // })

        const result = await product.findAndCountAll({
            group: ['id'],
            include: {
                model: orderitem,
                attributes: {
                    exclude: ['createdAt', 'updatedAt'],
                },
            },
        })

        success(res, result)
    } catch (error) {
        console.log(error)
        failed(res)
    }
}
