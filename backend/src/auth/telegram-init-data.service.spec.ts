import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { createHmac } from 'node:crypto';

import { TelegramInitDataService } from './telegram-init-data.service';

const BOT_TOKEN = '123456:TEST-TOKEN-FOR-UNIT-TESTS';

/** Собирает подписанную строку initData так же, как это делает Telegram. */
function buildInitData(
  params: Record<string, string>,
  token = BOT_TOKEN,
): string {
  const dataCheckString = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('\n');

  const secretKey = createHmac('sha256', 'WebAppData').update(token).digest();
  const hash = createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  const search = new URLSearchParams(params);
  search.set('hash', hash);

  return search.toString();
}

function createService(): TelegramInitDataService {
  const configService = {
    getOrThrow: jest.fn().mockReturnValue(BOT_TOKEN),
  } as unknown as ConfigService;

  return new TelegramInitDataService(configService);
}

describe('TelegramInitDataService', () => {
  const nowSeconds = Math.floor(Date.now() / 1000);

  const validUser = JSON.stringify({
    id: 533519962,
    username: 'tester',
    first_name: 'Тест',
    last_name: 'Тестов',
    language_code: 'ru',
  });

  it('принимает корректно подписанную строку', () => {
    const service = createService();

    const initData = buildInitData({
      auth_date: String(nowSeconds),
      query_id: 'AAA',
      user: validUser,
    });

    const user = service.validate(initData);

    expect(user.id).toBe('533519962');
    expect(user.username).toBe('tester');
    expect(user.firstName).toBe('Тест');
  });

  it('отклоняет подпись, сделанную чужим токеном', () => {
    const service = createService();

    const initData = buildInitData(
      { auth_date: String(nowSeconds), user: validUser },
      'другой-токен',
    );

    expect(() => service.validate(initData)).toThrow(UnauthorizedException);
  });

  it('отклоняет подменённый telegramId', () => {
    // Главная дыра до правки: telegramId брался из тела запроса, и подставить
    // чужой идентификатор мог кто угодно одним curl
    const service = createService();

    const initData = buildInitData({
      auth_date: String(nowSeconds),
      user: validUser,
    });

    const tampered = initData.replace('533519962', '111111111');

    expect(() => service.validate(tampered)).toThrow(UnauthorizedException);
  });

  it('отклоняет строку без подписи', () => {
    const service = createService();

    expect(() =>
      service.validate(`auth_date=${nowSeconds}&user=${validUser}`),
    ).toThrow(UnauthorizedException);
  });

  it('отклоняет протухшую строку', () => {
    const service = createService();

    const initData = buildInitData({
      auth_date: String(nowSeconds - 7200),
      user: validUser,
    });

    expect(() => service.validate(initData)).toThrow(UnauthorizedException);
  });

  it('отклоняет строку без данных пользователя', () => {
    const service = createService();

    const initData = buildInitData({ auth_date: String(nowSeconds) });

    expect(() => service.validate(initData)).toThrow(UnauthorizedException);
  });
});
