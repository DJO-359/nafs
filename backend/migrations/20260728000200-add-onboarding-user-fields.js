'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const existing = await queryInterface.describeTable('users');

    if (!existing.wakeTime) {
      await queryInterface.addColumn('users', 'wakeTime', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    if (!existing.sleepTime) {
      await queryInterface.addColumn('users', 'sleepTime', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    if (!existing.eveningReminderEnabled) {
      await queryInterface.addColumn('users', 'eveningReminderEnabled', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }

    if (!existing.onboardingCompleted) {
      await queryInterface.addColumn('users', 'onboardingCompleted', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'wakeTime');
    await queryInterface.removeColumn('users', 'sleepTime');
    await queryInterface.removeColumn('users', 'eveningReminderEnabled');
    await queryInterface.removeColumn('users', 'onboardingCompleted');
  },
};
