'use strict'
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('ordertoppings', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            orderItemId: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'orderitems',
                    key: 'id',
                },
            },
            toppingId: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'toppings',
                    key: 'id',
                },
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        })
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('ordertoppings')
    },
}
