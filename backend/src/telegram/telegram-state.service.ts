import { Injectable } from '@nestjs/common';
import { TelegramState } from './states/telegram-state.enum';

@Injectable()
export class TelegramStateService {
  private states = new Map<string, TelegramState>();

  setState(telegramId: string, state: TelegramState) {
    this.states.set(telegramId, state);
  }

  getState(telegramId: string) {
    return this.states.get(telegramId) ?? TelegramState.IDLE;
  }

  clearState(telegramId: string) {
    this.states.delete(telegramId);
  }
}
