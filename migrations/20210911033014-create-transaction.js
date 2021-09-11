'use strict'
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('transactions', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            userId: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'users',
                    key: 'id',
                },
            },
            status: {
                type: Sequelize.STRING,
                defaultValue: 'waiting',
            },
            fullName: {
                type: Sequelize.STRING,
            },
            email: {
                type: Sequelize.STRING,
            },
            phone: {
                type: Sequelize.STRING,
            },
            poscode: {
                type: Sequelize.STRING,
            },
            address: {
                type: Sequelize.STRING,
            },
            attachment: {
                type: Sequelize.STRING,
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
        await queryInterface.dropTable('transactions')
    },
}
