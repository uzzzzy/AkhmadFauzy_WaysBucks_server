'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class orderitem extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            orderitem.belongsTo(models.product, {
                foreignKey: {
                    name: 'productId',
                },
            })

            orderitem.belongsToMany(models.topping, {
                through: models.ordertopping,
                foreignKey: 'orderItemId',
            })

            orderitem.belongsTo(models.transaction, {
                foreignKey: {
                    name: 'transactionDetailId',
                },
            })
        }
    }
    orderitem.init(
        {
            productId: DataTypes.INTEGER,
            userId: DataTypes.INTEGER,
            transactionDetailId: DataTypes.INTEGER,
            qty: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: 'orderitem',
        }
    )
    return orderitem
}
