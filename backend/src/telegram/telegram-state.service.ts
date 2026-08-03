import { Injectable } from '@nestjs/common';

import { TelegramState } from './states/telegram-state.enum';

/** Сколько живёт незавершённый диалог. */
const STATE_TTL_MS = 15 * 60 * 1000;

interface StateEntry {
  state: TelegramState;
  expiresAt: number;
}

/**
 * Состояние диалога с ботом.
 *
 * Хранится в памяти процесса: при рестарте незавершённый ввод теряется,
 * а при нескольких инстансах состояние не разделяется. Для одного инстанса
 * этого достаточно; при горизонтальном масштабировании нужно вынести в Redis.
 * TTL добавлен, чтобы забытые диалоги не висели в памяти вечно.
 */
@Injectable()
export class TelegramStateService {
  private readonly states = new Map<string, StateEntry>();

  setState(telegramId: string, state: TelegramState): void {
    this.states.set(telegramId, {
      state,
      expiresAt: Date.now() + STATE_TTL_MS,
    });

    this.evictExpired();
  }

  getState(telegramId: string): TelegramState {
    const entry = this.states.get(telegramId);

    if (!entry) {
      return TelegramState.IDLE;
    }

    if (entry.expiresAt <= Date.now()) {
      this.states.delete(telegramId);
      return TelegramState.IDLE;
    }

    return entry.state;
  }

  clearState(telegramId: string): void {
    this.states.delete(telegramId);
  }

  private evictExpired(): void {
    const now = Date.now();

    for (const [key, entry] of this.states) {
      if (entry.expiresAt <= now) {
        this.states.delete(key);
      }
    }
  }
}
