'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('tasbih_counters', 'color', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'emerald',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('tasbih_counters', 'color');
  },
};
