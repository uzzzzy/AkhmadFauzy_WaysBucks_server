const { orderitem: table, ordertopping, product, topping } = require('../../../models')
const { handleImage, failed } = require('../functions')

exports.getCartItem = async (req, res) => {
    try {
        let result = []
        let count = 0
        let cartTotal = 0

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
                item.product.image = handleImage(item.product.image, 'products')

                topping.forEach((toppItem) => ((subtotal += toppItem.price), toppItem.image ? (toppItem.image = handleImage(toppItem.image, 'toppings')) : toppItem))

                topping.sort((a, b) => {
                    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
                })

                cartTotal += subtotal * item.qty

                result[i] = {
                    id: item.id,
                    subtotal,
                    qty: item.qty,
                    product: item.product,
                    topping,
                }
            })
        })

        return res.send(
            req.query.count
                ? {
                      status: 'success',
                      count,
                  }
                : {
                      status: 'success',
                      subtotal: cartTotal,
                      count,
                      total: cartTotal + cartTotal * 0.1,
                      data: {
                          carts: result,
                      },
                  }
        )
    } catch (error) {
        failed(res)
    }
}

exports.addOrUpdateItem = async (req, res) => {
    try {
        const { body, user } = req

        let result = await table
            .findAll({
                where: {
                    userId: user.id,
                    productId: body.productId,
                    transactionDetailId: null,
                },
                attributes: ['id', 'qty'],
                include: [
                    {
                        model: topping,
                        attributes: ['id'],
                        through: {
                            attributes: [],
                        },
                    },
                ],
            })
            .catch((err) => err)

        if (result.length > 0) {
            const orderItemId = result.map((item) => item.id)
            const orderQty = result.map((item) => item.qty)
            let toppings = result.map((item) => item.toppings)

            toppings = toppings.map((item) => item.map((itemT) => itemT.id))
            let tempId = null
            toppings.forEach((item, i) => {
                console.log(item.toString() === body.toppings, item.toString(), body.toppings)
                item.toString() === body.toppings ? (tempId = i) : null
            })

            if (tempId !== null) {
                await table.update(
                    {
                        qty: orderQty[tempId] + body.qty,
                    },
                    {
                        where: {
                            id: orderItemId[tempId],
                        },
                    }
                )

                return res.send({
                    status: 'success',
                    message: 'order quantity updated',
                })
            }
        }

        const { id: orderId } = await table.create({
            productId: req.body.productId,
            userId: user.id,
            qty: parseInt(req.body.qty),
        })

        if (body.toppings.length > 0) {
            tl = []
            body.toppings.split(',').map(
                (item, i) =>
                    (tl[i] = {
                        orderItemId: orderId,
                        toppingId: parseInt(item),
                    })
            )

            await ordertopping.bulkCreate(tl)
        }

        return res.send({ status: 'success', message: 'order added to cart' })
    } catch (error) {
        failed(res)
    }
}

exports.deleteCartItem = async (req, res) => {
    const { id } = req.params

    await table.destroy({ where: { id } })
    await ordertopping.destroy({
        where: {
            orderItemId: id,
        },
    })

    return res.send({
        status: 'success',
        data: req.body,
    })
}
