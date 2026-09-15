'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      'ALTER TYPE "enum_habits_periodType" ADD VALUE IF NOT EXISTS \'60_DAYS\'',
    );
  },

  async down() {
    // PostgreSQL does not safely remove a value from an existing enum in place.
  },
};
