import { Injectable } from '@nestjs/common';
//import { InjectRepository } from '@nestjs/typeorm';
//import { Product } from 'src/products/entities';
import { ProductsService } from 'src/products/products.service';
//import { Repository } from 'typeorm';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
  constructor(private readonly productService: ProductsService) {}
  //@InjectRepository(Product)
  //private readonly productsRepository: Repository<Product>,

  async seedSlow() {
    await this.productService.removeAll();
    // await this.productsRepository.insert(initialData.products); // ens cal les interfaces correctes
    initialData.products.forEach(async (p) => {
      await this.productService.create(p);
    });
    return `Seed successfully executed`;
  }

  async seed() {
    await this.productService.removeAll();
    const insertPromises = [];
    initialData.products.forEach(async (p) => {
      insertPromises.push(this.productService.create(p));
    });
    await Promise.all(insertPromises);
    return `Seed successfully executed`;
  }
}
