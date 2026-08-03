/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();

const useSsl = process.env.DB_SSL !== 'false';

/** Конфигурация для sequelize-cli. Приложение читает те же переменные. */
const base = {
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dialectOptions: useSsl
    ? { ssl: { require: true, rejectUnauthorized: true } }
    : {},
  logging: false,
};

module.exports = {
  development: base,
  test: base,
  production: base,
};
