'use strict';

/**
 * Migration: добавляет поля для отслеживания дневного прогресса счётчиков Тасбих.
 *
 * countAtDayStart: сохраняет значение count на начало дня
 * dailyCompleted: количество полных циклов за текущий день
 * lastActiveDate: дата последнего обновления в timezone пользователя (YYYY-MM-DD)
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = 'tasbih_counters';
    const existing = await queryInterface.describeTable(table);

    // Добавляем countAtDayStart, если его нет
    if (!existing.countAtDayStart) {
      await queryInterface.addColumn(table, 'countAtDayStart', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    }

    // Добавляем dailyCompleted, если его нет
    if (!existing.dailyCompleted) {
      await queryInterface.addColumn(table, 'dailyCompleted', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    }

    // Добавляем lastActiveDate, если его нет
    if (!existing.lastActiveDate) {
      await queryInterface.addColumn(table, 'lastActiveDate', {
        type: Sequelize.DATEONLY,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const table = 'tasbih_counters';
    const existing = await queryInterface.describeTable(table);

    if (existing.countAtDayStart) {
      await queryInterface.removeColumn(table, 'countAtDayStart');
    }

    if (existing.dailyCompleted) {
      await queryInterface.removeColumn(table, 'dailyCompleted');
    }

    if (existing.lastActiveDate) {
      await queryInterface.removeColumn(table, 'lastActiveDate');
    }
  },
};
