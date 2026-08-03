import * as Joi from 'joi';

/**
 * Схема валидации переменных окружения.
 * Приложение не стартует, если обязательная переменная отсутствует
 * или не проходит проверку — вместо тихой работы на небезопасных дефолтах.
 */
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  PORT: Joi.number().port().default(3000),

  // База данных
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().port().required(),
  DB_NAME: Joi.string().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_SSL: Joi.boolean().default(true),
  DB_SYNC: Joi.boolean().default(false),
  DB_LOGGING: Joi.boolean().default(false),

  // Аутентификация
  JWT_SECRET: Joi.string().min(32).required().messages({
    'string.min':
      "JWT_SECRET должен быть не короче 32 символов. Сгенерировать: node -e \"console.log(require('crypto').randomBytes(48).toString('base64url'))\"",
  }),
  JWT_EXPIRES: Joi.string().default('7d'),

  // Telegram
  TELEGRAM_BOT_TOKEN: Joi.string().required(),
  TELEGRAM_ENABLED: Joi.boolean().default(true),
  MINI_APP_URL: Joi.string().uri().required(),

  // Разрешённые источники для CORS, через запятую
  CORS_ORIGINS: Joi.string().default(''),

  /**
   * Dev-обход авторизации: позволяет войти без Telegram initData.
   * Игнорируется, если NODE_ENV === 'production'.
   */
  DEV_TELEGRAM_ID: Joi.string().optional(),
});
