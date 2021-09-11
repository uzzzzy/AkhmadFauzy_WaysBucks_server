const { orderitem: table, product, topping } = require('../../models')
const { handleImage, failed } = require('../functions')

exports.getCartItem = async (req, res) => {
    try {
        let result = []
        let count = 0

        const { toppingAttributes } = req.query

        const query = {
            where: {
                userId: req.user.id,
                transactionDetailId: null,
            },
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
                    attributes: toppingAttributes ? toppingAttributes.split(',') : ['id', 'title', 'price', 'image'],
                    through: {
                        attributes: [],
                    },
                },
            ],
        }

        await table.findAll(query).then((res) => {
            res.forEach((item, i) => {
                let subtotal = item.product.price
                let topping = item.toppings
                count += item.qty
                item.product.image = handleImage(item.product.image, 'product')

                topping.forEach((toppItem) => ((subtotal += toppItem.price), toppItem.image ? (toppItem.image = handleImage(toppItem.image, 'toppings')) : toppItem))

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
        })

        res.send(
            req.query.count
                ? {
                      status: 'success',
                      count,
                  }
                : {
                      status: 'success',
                      count,
                      data: result,
                  }
        )
    } catch (error) {
        failed(res)
    }
}
