'use strict';

/**
 * Baseline: приводит схему к состоянию, которое раньше создавалось
 * через sequelize.sync(). Идемпотентна — существующие таблицы не трогает,
 * поэтому её можно накатить на уже работающую базу.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const existing = await queryInterface.showAllTables();
    const has = (name) =>
      existing.some((table) =>
        (typeof table === 'string' ? table : table.tableName) === name,
      );

    if (!has('users')) {
      await queryInterface.createTable('users', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('gen_random_uuid()'),
          primaryKey: true,
        },
        email: { type: Sequelize.STRING, allowNull: true, unique: true },
        passwordHash: { type: Sequelize.STRING, allowNull: true },
        telegramId: { type: Sequelize.STRING, allowNull: true, unique: true },
        username: { type: Sequelize.STRING, allowNull: true },
        firstName: { type: Sequelize.STRING, allowNull: true },
        lastName: { type: Sequelize.STRING, allowNull: true },
        authProvider: {
          type: Sequelize.ENUM('telegram', 'email', 'google', 'apple'),
          defaultValue: 'telegram',
        },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      });
    }

    if (!has('intentions')) {
      await queryInterface.createTable('intentions', {
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
        text: { type: Sequelize.TEXT, allowNull: false },
        date: { type: Sequelize.DATEONLY, allowNull: false },
        completed: { type: Sequelize.BOOLEAN, defaultValue: false },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      });
    }

    if (!has('diary_entries')) {
      await queryInterface.createTable('diary_entries', {
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
        content: { type: Sequelize.TEXT, allowNull: false },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      });
    }

    if (!has('reminders')) {
      await queryInterface.createTable('reminders', {
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
        title: { type: Sequelize.STRING, allowNull: false },
        description: { type: Sequelize.TEXT, allowNull: true },
        remindAt: { type: Sequelize.DATE, allowNull: false },
        repeatType: {
          type: Sequelize.ENUM(
            'none',
            'daily',
            'weekly',
            'monthly',
            'custom',
            'interval',
          ),
          defaultValue: 'none',
        },
        repeatInterval: { type: Sequelize.INTEGER, defaultValue: 1 },
        repeatDays: { type: Sequelize.JSONB, allowNull: true },
        lastTriggeredAt: { type: Sequelize.DATE, allowNull: true },
        completed: { type: Sequelize.BOOLEAN, defaultValue: false },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      });
    }

    if (!has('habits')) {
      await queryInterface.createTable('habits', {
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
        title: { type: Sequelize.STRING, allowNull: false },
        description: { type: Sequelize.TEXT, allowNull: true },
        icon: { type: Sequelize.STRING, allowNull: false },
        color: { type: Sequelize.STRING, allowNull: false },
        periodType: {
          type: Sequelize.ENUM(
            '30_DAYS',
            '3_MONTHS',
            '6_MONTHS',
            '1_YEAR',
            'CUSTOM',
          ),
          allowNull: false,
        },
        customPeriodDays: { type: Sequelize.INTEGER, allowNull: true },
        startDate: { type: Sequelize.DATEONLY, allowNull: false },
        endDate: { type: Sequelize.DATEONLY, allowNull: false },
        isArchived: { type: Sequelize.BOOLEAN, defaultValue: false },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      });
    }

    if (!has('habit_completions')) {
      await queryInterface.createTable('habit_completions', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('gen_random_uuid()'),
          primaryKey: true,
        },
        habitId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'habits', key: 'id' },
          onDelete: 'CASCADE',
        },
        completedDate: { type: Sequelize.DATEONLY, allowNull: false },
        createdAt: { type: Sequelize.DATE, allowNull: false },
      });
    }
  },

  async down() {
    // Baseline не откатывается: откат уронил бы боевые данные целиком
    throw new Error('Baseline-миграция не поддерживает откат');
  },
};
