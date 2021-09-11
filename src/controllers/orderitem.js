const { orderitem: table, product, topping } = require('../../models')
const { handleImage, failed } = require('../functions')

exports.getAllOrderItem = async (req, res) => {
    try {
        let result = []
        await table
            .findAndCountAll({
                attributes: {
                    exclude: ['productId', 'createdAt', 'updatedAt'],
                },
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
            })
            .then((res) =>
                res.rows.forEach((item, i) => {
                    let subtotal = item.product.price
                    let topping = item.toppings
                    item.product.image = handleImage(item.product.image, 'product')
                    topping.forEach((toppItem) => ((subtotal += toppItem.price), (toppItem.image = handleImage(toppItem.image, 'toppings'))))

                    topping.sort((a, b) => {
                        return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
                    })

                    result[i] = {
                        id: item.id,
                        subtotal,
                        qty: item.qty,
                        product: item.product,
                        topping,
                    }
                })
            )
            .catch((err) => err)

        res.send({
            status: 'success',
            data: result,
        })
    } catch (error) {
        return failed(res)
    }
}
