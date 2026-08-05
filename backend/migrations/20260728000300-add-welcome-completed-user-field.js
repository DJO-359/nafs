'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const existing = await queryInterface.describeTable('users');

    if (!existing.welcomeCompleted) {
      await queryInterface.addColumn('users', 'welcomeCompleted', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'welcomeCompleted');
  },
};
