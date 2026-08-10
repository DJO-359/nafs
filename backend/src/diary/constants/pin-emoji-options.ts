export const PIN_EMOJI_OPTIONS = [
  '😊',
  '❤️',
  '⭐',
  '💡',
  '🎯',
  '📖',
  '🔥',
  '🌙',
  '☀️',
  '🙏',
  '💭',
  '✅',
] as const;

export type PinEmojiValue = (typeof PIN_EMOJI_OPTIONS)[number];

export function isPinEmojiValue(value: unknown): value is PinEmojiValue {
  return (
    typeof value === 'string' &&
    PIN_EMOJI_OPTIONS.includes(value as PinEmojiValue)
  );
}
