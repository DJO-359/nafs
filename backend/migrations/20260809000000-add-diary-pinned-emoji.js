'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const diaryColumns = await queryInterface.describeTable('diary_entries');

    if (!diaryColumns.isPinned) {
      await queryInterface.addColumn('diary_entries', 'isPinned', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }

    if (!diaryColumns.pinEmoji) {
      await queryInterface.addColumn('diary_entries', 'pinEmoji', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const diaryColumns = await queryInterface.describeTable('diary_entries');

    if (diaryColumns.pinEmoji) {
      await queryInterface.removeColumn('diary_entries', 'pinEmoji');
    }

    if (diaryColumns.isPinned) {
      await queryInterface.removeColumn('diary_entries', 'isPinned');
    }
  },
};
