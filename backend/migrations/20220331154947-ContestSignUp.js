'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction((t) => {
            return Promise.all([
                queryInterface.addColumn(
                    'User',
                    'bestScore',
                    {
                        type: Sequelize.DataTypes.BIGINT,
                        allowNull: true,
                    },
                    { transaction: t }
                ),

                queryInterface.addColumn(
                    'User',
                    'isSignedUp',
                    {
                        type: Sequelize.DataTypes.BOOLEAN,
                        allowNull: false,
                        defaultValue: false,
                    },
                    { transaction: t }
                ),
            ]);
        });
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction((t) => {
            return Promise.all([
                queryInterface.removeColumn('User', 'bestScore', {
                    transaction: t,
                }),

                queryInterface.removeColumn('User', 'isSignedUp', {
                    transaction: t,
                }),
            ]);
        });
    },
};
