'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class transaction extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            transaction.belongsTo(models.user, {
                foreignKey: {
                    name: 'userId',
                },
            })

            transaction.hasMany(models.orderitem, {
                foreignKey: {
                    name: 'transactionDetailId',
                },
            })
        }
    }
    transaction.init(
        {
            userId: DataTypes.INTEGER,
            status: DataTypes.STRING,
            fullName: DataTypes.STRING,
            email: DataTypes.STRING,
            phone: DataTypes.STRING,
            poscode: DataTypes.STRING,
            address: DataTypes.STRING,
            attachment: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: 'transaction',
        }
    )
    return transaction
}
