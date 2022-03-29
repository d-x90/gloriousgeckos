'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction((t) => {
            return Promise.all([
                queryInterface.addColumn(
                    'Nft',
                    'isStaked',
                    {
                        type: Sequelize.DataTypes.BOOLEAN,
                        defaultValue: false,
                    },
                    { transaction: t }
                ),

                queryInterface.addColumn(
                    'Nft',
                    'claimableStakingRewards',
                    {
                        type: Sequelize.DataTypes.INTEGER,
                        defaultValue: 0,
                    },
                    { transaction: t }
                ),

                queryInterface.addColumn(
                    'Nft',
                    'claimedStakingRewards',
                    {
                        type: Sequelize.DataTypes.INTEGER,
                        defaultValue: 0,
                    },
                    { transaction: t }
                ),

                queryInterface.addColumn(
                    'Nft',
                    'stakingDaysLeft',
                    {
                        type: Sequelize.DataTypes.INTEGER,
                        defaultValue: 50,
                    },
                    { transaction: t }
                ),
            ]);
        });
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction((t) => {
            return Promise.all([
                queryInterface.removeColumn('Nft', 'isStaked', {
                    transaction: t,
                }),

                queryInterface.removeColumn('Nft', 'claimableStakingRewards', {
                    transaction: t,
                }),

                queryInterface.removeColumn('Nft', 'claimedStakingRewards', {
                    transaction: t,
                }),

                queryInterface.removeColumn('Nft', 'stakingDaysLeft', {
                    transaction: t,
                }),
            ]);
        });
    },
};
