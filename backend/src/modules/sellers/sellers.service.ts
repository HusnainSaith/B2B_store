import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './entities/store.entity';

/** Single-store service. The historical class name keeps internal imports stable. */
@Injectable()
export class SellersService {
  constructor(
    @InjectRepository(Store) private readonly storeRepo: Repository<Store>,
  ) {}

  async createStore(dto: Partial<Store>): Promise<Store> {
    if (await this.storeRepo.exist()) {
      throw new ConflictException(
        'This application already has a store. Update the existing store instead.',
      );
    }
    return this.storeRepo.save(this.storeRepo.create(dto));
  }

  async findCurrentStore(): Promise<Store> {
    const store = await this.storeRepo.findOne({ where: { singletonKey: true } });
    if (!store) throw new NotFoundException('Store has not been configured');
    return store;
  }

  async findAllStores(): Promise<Store[]> {
    const store = await this.storeRepo.findOne({ where: { singletonKey: true } });
    return store ? [store] : [];
  }

  async findStore(id: string): Promise<Store> {
    const store = await this.findCurrentStore();
    if (store.id !== id) throw new NotFoundException('Store not found');
    return store;
  }

  async findStoreBySlug(slug: string): Promise<Store> {
    const store = await this.findCurrentStore();
    if (store.slug !== slug) throw new NotFoundException('Store not found');
    return store;
  }

  async updateCurrentStore(dto: Partial<Store>): Promise<Store> {
    const store = await this.findCurrentStore();
    Object.assign(store, dto, { singletonKey: true });
    return this.storeRepo.save(store);
  }

  async updateStore(id: string, dto: Partial<Store>): Promise<Store> {
    const store = await this.findStore(id);
    Object.assign(store, dto, { singletonKey: true });
    return this.storeRepo.save(store);
  }
}
