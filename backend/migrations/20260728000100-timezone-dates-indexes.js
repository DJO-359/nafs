'use strict';

/**
 * Приводит схему к состоянию после аудита:
 *  - часовой пояс пользователя и отметка блокировки бота;
 *  - день записи дневника отдельной колонкой (раньше выводился из createdAt);
 *  - поле переноса напоминания, не ломающее расписание повтора;
 *  - уникальные ограничения на «одна запись в день»;
 *  - индексы под реальные запросы (их не было ни одного).
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const describe = async (table) => {
      try {
        return await queryInterface.describeTable(table);
      } catch {
        return {};
      }
    };

    const addColumnIfMissing = async (table, column, spec) => {
      const columns = await describe(table);
      if (!columns[column]) {
        await queryInterface.addColumn(table, column, spec);
      }
    };

    const addIndexSafely = async (table, fields, options) => {
      try {
        await queryInterface.addIndex(table, fields, options);
      } catch (error) {
        // Индекс уже есть — это нормально при повторном прогоне
        if (!/already exists/i.test(error.message)) {
          throw error;
        }
      }
    };

    // --- users -------------------------------------------------------------
    await addColumnIfMissing('users', 'timezone', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'UTC',
    });

    await addColumnIfMissing('users', 'telegramBlockedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // --- diary_entries -----------------------------------------------------
    const diaryColumns = await describe('diary_entries');

    if (!diaryColumns.date) {
      await queryInterface.addColumn('diary_entries', 'date', {
        type: Sequelize.DATEONLY,
        allowNull: true,
      });

      // Переносим день из createdAt для уже существующих записей
      await queryInterface.sequelize.query(
        'UPDATE "diary_entries" SET "date" = "createdAt"::date WHERE "date" IS NULL',
      );

      // Схлопываем дубли за один день, оставляя самую свежую запись
      await queryInterface.sequelize.query(`
        DELETE FROM "diary_entries" a
        USING "diary_entries" b
        WHERE a."userId" = b."userId"
          AND a."date" = b."date"
          AND a."createdAt" < b."createdAt"
      `);

      await queryInterface.changeColumn('diary_entries', 'date', {
        type: Sequelize.DATEONLY,
        allowNull: false,
      });
    }

    await addIndexSafely('diary_entries', ['userId', 'date'], {
      unique: true,
      name: 'diary_entries_user_date_uk',
    });

    // --- intentions --------------------------------------------------------
    // Дубли на одну дату могли появиться из-за find-then-create без индекса
    await queryInterface.sequelize.query(`
      DELETE FROM "intentions" a
      USING "intentions" b
      WHERE a."userId" = b."userId"
        AND a."date" = b."date"
        AND a."createdAt" < b."createdAt"
    `);

    await addIndexSafely('intentions', ['userId', 'date'], {
      unique: true,
      name: 'intentions_user_date_uk',
    });

    // --- reminders ---------------------------------------------------------
    await addColumnIfMissing('reminders', 'snoozedUntil', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await addIndexSafely('reminders', ['userId', 'remindAt'], {
      name: 'reminders_user_remind_at_idx',
    });

    await addIndexSafely('reminders', ['completed', 'remindAt'], {
      name: 'reminders_completed_remind_at_idx',
    });

    await addIndexSafely('reminders', ['snoozedUntil'], {
      name: 'reminders_snoozed_until_idx',
    });

    // Ноль в интервале повтора заставлял планировщик слать сообщение каждую минуту
    await queryInterface.sequelize.query(
      'UPDATE "reminders" SET "repeatInterval" = 1 WHERE "repeatInterval" IS NULL OR "repeatInterval" < 1',
    );

    // --- habits ------------------------------------------------------------
    await addIndexSafely('habits', ['userId'], { name: 'habits_user_idx' });

    await queryInterface.sequelize.query(`
      DELETE FROM "habit_completions" a
      USING "habit_completions" b
      WHERE a."habitId" = b."habitId"
        AND a."completedDate" = b."completedDate"
        AND a."createdAt" < b."createdAt"
    `);

    await addIndexSafely('habit_completions', ['habitId', 'completedDate'], {
      unique: true,
      name: 'habit_completions_habit_date_uk',
    });
  },

  async down(queryInterface) {
    const dropIndexSafely = async (table, name) => {
      try {
        await queryInterface.removeIndex(table, name);
      } catch {
        // Индекса нет — откатывать нечего
      }
    };

    await dropIndexSafely('habit_completions', 'habit_completions_habit_date_uk');
    await dropIndexSafely('habits', 'habits_user_idx');
    await dropIndexSafely('reminders', 'reminders_snoozed_until_idx');
    await dropIndexSafely('reminders', 'reminders_completed_remind_at_idx');
    await dropIndexSafely('reminders', 'reminders_user_remind_at_idx');
    await dropIndexSafely('intentions', 'intentions_user_date_uk');
    await dropIndexSafely('diary_entries', 'diary_entries_user_date_uk');

    await queryInterface.removeColumn('reminders', 'snoozedUntil');
    await queryInterface.removeColumn('diary_entries', 'date');
    await queryInterface.removeColumn('users', 'telegramBlockedAt');
    await queryInterface.removeColumn('users', 'timezone');
  },
};
