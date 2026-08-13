'use strict';

/**
 * Migration: создаёт таблицу для счётчиков Тасбих/Асхар.
 * Поддерживает как целевые счётчики (с target), так и бесконечные (isInfinite).
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const existing = await queryInterface.showAllTables();
    const has = (name) =>
      existing.some(
        (table) =>
          (typeof table === 'string' ? table : table.tableName) === name,
      );

    if (!has('tasbih_counters')) {
      await queryInterface.createTable('tasbih_counters', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('gen_random_uuid()'),
          primaryKey: true,
        },
        userId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onDelete: 'CASCADE',
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        target: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        count: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        isInfinite: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      });

      // Индекс для быстрой выборки всех счётчиков пользователя
      await queryInterface.addIndex('tasbih_counters', ['userId'], {
        name: 'tasbih_counters_user_idx',
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tasbih_counters');
  },
};
