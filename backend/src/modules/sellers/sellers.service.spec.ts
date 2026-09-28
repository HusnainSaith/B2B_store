import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import { SellersService } from './sellers.service';

describe('SellersService (single-store mode)', () => {
  let repository: jest.Mocked<Pick<Repository<Store>, 'exist' | 'create' | 'save' | 'findOne'>>;
  let service: SellersService;

  beforeEach(() => {
    repository = {
      exist: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };
    service = new SellersService(repository as unknown as Repository<Store>);
  });

  it('rejects creation when the store is already configured', async () => {
    repository.exist.mockResolvedValue(true);

    await expect(service.createStore({ name: 'Second store' })).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('returns the singleton store', async () => {
    const store = { id: 'store-1', singletonKey: true } as Store;
    repository.findOne.mockResolvedValue(store);

    await expect(service.findCurrentStore()).resolves.toBe(store);
    expect(repository.findOne).toHaveBeenCalledWith({
      where: { singletonKey: true },
    });
  });

  it('reports an unconfigured store clearly', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.findCurrentStore()).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('never permits the singleton marker to be changed', async () => {
    const store = { id: 'store-1', singletonKey: true, name: 'Old' } as Store;
    repository.findOne.mockResolvedValue(store);
    repository.save.mockImplementation(async (value) => value as Store);

    const updated = await service.updateCurrentStore({
      name: 'New',
      singletonKey: false,
    });

    expect(updated.name).toBe('New');
    expect(updated.singletonKey).toBe(true);
  });
});
