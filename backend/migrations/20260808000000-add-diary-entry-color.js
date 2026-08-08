'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('diary_entries', 'color', {
      type: Sequelize.STRING(7),
      allowNull: false,
      defaultValue: '#ffffff',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('diary_entries', 'color');
  },
};
