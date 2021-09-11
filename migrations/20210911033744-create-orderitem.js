'use strict'
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('orderitems', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            productId: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'products',
                    key: 'id',
                },
            },
            userId: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'users',
                    key: 'id',
                },
            },
            transactionDetailId: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'transactions',
                    key: 'id',
                },
            },
            qty: {
                type: Sequelize.INTEGER,
                defaultValue: 1,
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
        await queryInterface.dropTable('orderitems')
    },
}
