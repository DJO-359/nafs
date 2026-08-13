import { DiaryService } from './diary.service';

describe('DiaryService', () => {
  let diaryModel: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    count: jest.Mock;
  };
  let service: DiaryService;

  beforeEach(() => {
    diaryModel = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      count: jest.fn(),
    };

    service = new DiaryService(diaryModel as never);
  });

  it('creates a new diary entry without checking for an existing record', async () => {
    diaryModel.create.mockResolvedValue({ id: 'entry-1' });

    const result = await service.create('user-1', 'UTC', 'hello');

    expect(result).toEqual({ id: 'entry-1' });
    expect(diaryModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        content: 'hello',
        date: expect.any(String),
      }),
    );
  });

  it('loads diary entries for a day as an array ordered by createdAt', async () => {
    const rows = [{ id: 'entry-1' }, { id: 'entry-2' }];
    diaryModel.findAll.mockResolvedValue(rows);

    await expect(service.getByDate('user-1', '2026-08-07')).resolves.toEqual(
      rows,
    );

    expect(diaryModel.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-1', date: '2026-08-07' },
        order: [['createdAt', 'DESC']],
      }),
    );
    expect(diaryModel.findOne).not.toHaveBeenCalled();
  });

  it('updates only the target entry when pinning a new one on the same date', async () => {
    const previousEntry = {
      id: 'entry-1',
      userId: 'user-1',
      date: '2026-08-07',
      isPinned: true,
      pinEmoji: '⭐',
      update: jest.fn().mockResolvedValue(undefined),
    };
    const nextEntry = {
      id: 'entry-2',
      userId: 'user-1',
      date: '2026-08-07',
      isPinned: false,
      pinEmoji: null,
      update: jest.fn().mockResolvedValue({
        id: 'entry-2',
        isPinned: true,
        pinEmoji: '❤️',
      }),
    };

    diaryModel.findOne.mockResolvedValue(nextEntry);
    diaryModel.findAll.mockResolvedValue([previousEntry]);

    await service.update('user-1', 'entry-2', {
      content: 'updated',
      isPinned: true,
      pinEmoji: '❤️',
    });

    expect(previousEntry.update).not.toHaveBeenCalled();
    expect(nextEntry.update).toHaveBeenCalledWith({
      content: 'updated',
      isPinned: true,
      pinEmoji: '❤️',
    });
  });
});
