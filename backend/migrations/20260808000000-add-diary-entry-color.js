'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('diary_entries', 'color', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '#10b981',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('diary_entries', 'color');
  },
};
