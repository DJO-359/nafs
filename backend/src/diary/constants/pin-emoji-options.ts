export const PIN_EMOJI_OPTIONS = [
  // keep existing backend emojis
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
  // include frontend picker emojis so backend accepts what UI sends
  '▶️',
  '🎓',
  '💼',
  '📝',
  '💻',
  '🧠',
  '🏋️',
  '💰',
] as const;

export type PinEmojiValue = (typeof PIN_EMOJI_OPTIONS)[number];

export function isPinEmojiValue(value: unknown): value is PinEmojiValue {
  return (
    typeof value === 'string' &&
    PIN_EMOJI_OPTIONS.includes(value as PinEmojiValue)
  );
}
