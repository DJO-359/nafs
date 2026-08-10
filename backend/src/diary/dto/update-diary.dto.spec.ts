import { validate } from 'class-validator';

import { UpdateDiaryDto } from './update-diary.dto';

describe('UpdateDiaryDto pinEmoji validation', () => {
  it('accepts a supported multi-codepoint emoji', async () => {
    const dto = new UpdateDiaryDto();
    dto.content = 'hello';
    dto.isPinned = true;
    dto.pinEmoji = '❤️';

    const errors = await validate(dto);

    expect(
      errors.filter((error) => error.property === 'pinEmoji'),
    ).toHaveLength(0);
  });

  it('accepts null for unpinning', async () => {
    const dto = new UpdateDiaryDto();
    dto.content = 'hello';
    dto.isPinned = false;
    dto.pinEmoji = null;

    const errors = await validate(dto);

    expect(
      errors.filter((error) => error.property === 'pinEmoji'),
    ).toHaveLength(0);
  });

  it('rejects non-whitelisted text', async () => {
    const dto = new UpdateDiaryDto();
    dto.content = 'hello';
    dto.pinEmoji = 'custom text';

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'pinEmoji')).toBe(true);
  });
});
