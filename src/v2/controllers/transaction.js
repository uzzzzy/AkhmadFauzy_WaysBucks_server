const { success, models } = require('../functions')

const { transaction: table, user } = models

exports.getTransactions = async (req, res) => {
    const query = {
        attributes: {
            exclude: ['createdAt'],
        },
    }

    const result = await table.findAndCountAll({
        attributes: {
            exclude: ['createdAt', 'updatedAt'],
        },
        include: [
            {
                model: user,
                as: 'userOrder',
                attributes: {
                    exclude: ['password', 'createdAt', 'updatedAt'],
                },
            },
        ],
    })

    success(res, result)
}
