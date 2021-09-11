const { orderlist: table, product, topping } = require('../../models')

exports.getAllList = async (req, res) => {
    const time = Date.now()
    res.send({
        data: time,
    })
}
