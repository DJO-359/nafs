import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

import { isPinEmojiValue } from '../constants/pin-emoji-options';

export function IsPinEmoji(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isPinEmoji',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: unknown, _args: ValidationArguments) {
          return (
            value === null || value === undefined || isPinEmojiValue(value)
          );
        },
      },
    });
  };
}
