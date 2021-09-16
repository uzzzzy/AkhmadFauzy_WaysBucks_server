'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class ordertopping extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            ordertopping.belongsTo(models.topping, {
                foreignKey: {
                    name: 'toppingId',
                },
            })
        }
    }
    ordertopping.init(
        {
            orderItemId: DataTypes.INTEGER,
            toppingId: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: 'ordertopping',
        }
    )
    return ordertopping
}
