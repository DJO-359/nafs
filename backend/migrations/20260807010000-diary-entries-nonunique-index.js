'use strict';

module.exports = {
  async up(queryInterface) {
    const dropIndexSafely = async (table, name) => {
      try {
        await queryInterface.removeIndex(table, name);
      } catch (error) {
        if (!/does not exist|not exist/i.test(error.message)) {
          throw error;
        }
      }
    };

    await dropIndexSafely('diary_entries', 'diary_entries_user_date_uk');

    await queryInterface.addIndex('diary_entries', ['userId', 'date'], {
      unique: false,
      name: 'diary_entries_user_date_idx',
    });
  },

  async down(queryInterface) {
    const dropIndexSafely = async (table, name) => {
      try {
        await queryInterface.removeIndex(table, name);
      } catch (error) {
        if (!/does not exist|not exist/i.test(error.message)) {
          throw error;
        }
      }
    };

    await dropIndexSafely('diary_entries', 'diary_entries_user_date_idx');

    await queryInterface.addIndex('diary_entries', ['userId', 'date'], {
      unique: true,
      name: 'diary_entries_user_date_uk',
    });
  },
};
