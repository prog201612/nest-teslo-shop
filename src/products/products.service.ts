import { BadRequestException, Logger } from '@nestjs/common';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { validate as uuidValidate } from 'uuid';
import { ProductImage } from './entities';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImagesRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource,
  ) {}

  async create(user: User, createProductDto: CreateProductDto) {
    try {
      // Separem les imatges de la resta de dades, per poder crear les entitats ProductImage
      const { images = [], ...productData } = createProductDto;
      // Creem l'entitat Product amb les dades rebudes i les imatges com a ProductImage
      const product = this.productsRepository.create({
        ...productData,
        owner: user,
        // TypeORM infereix el producte al qual pertanyen les imatges
        images: images.map((url) =>
          this.productImagesRepository.create({ url }),
        ),
      });
      // guarda tant el producte com les imatges
      await this.productsRepository.save(product);
      return { ...product, images };
    } catch (error) {
      this.handleException(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    console.log(paginationDto); // { limit: 2, offset: 0 }
    const { limit = 10, offset = 0 } = paginationDto;
    const products = await this.productsRepository.find({
      take: limit,
      skip: offset,
      relations: { images: true },
    });
    return products.map((p) => ({ ...p, images: p.images.map((i) => i.url) }));
  }

  async findOne(term: string) {
    /*let filter: { [key: string]: string } = { slug: term };
    if (uuidValidate(term)) filter = { id: term };
    const product = await this.productsRepository.findOneBy(filter);*/

    /*const product = await this.productsRepository.findOne({
      where: { id: term },
      relations: { images: true },
    });*/

    const product = await this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'product_images')
      .where('title ilike :title or product.id = :id or slug = :slug', {
        id: uuidValidate(term) ? term : null,
        slug: term,
        title: term,
      })
      .getOne();

    /*const product = await this.productsRepository.findOneBy({ id: term });
    if (!product) throw new BadRequestException('Product not found: ' + term);*/
    //return { ...product, images: product.images.map((i) => i.url) };
    if (!product) throw new BadRequestException('Product not found: ' + term);
    return product;
  }

  async findOnePlane(term: string) {
    const product = await this.findOne(term);
    if (!product) throw new BadRequestException('Product not found: ' + term);
    return { ...product, images: product.images.map((i) => i.url) };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      const { images, ...productData } = updateProductDto;

      // No carrega les relacions, però sí que carrega els valors de les propietats
      const product = await this.productsRepository.preload({
        id,
        ...productData,
      });
      if (!product) throw new BadRequestException('Product not found: ' + id);

      // Creem una transacció per poder fer rollback en cas d'error
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        if (images) {
          // Eliminem les imatges existents
          await queryRunner.manager.delete(ProductImage, {
            product: { id },
          });

          // Creem les noves imatges i les afegim al producte
          product.images = images.map((url) =>
            this.productImagesRepository.create({ url, product }),
          );
        } /*else {
          // Si no s'han passat imatges, les deixem com estaven
          product.images = await this.productImagesRepository.findBy({
            product: { id: product.id },
          });
        }*/

        await queryRunner.manager.save(product);

        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      }
      await queryRunner.release();
      return this.findOnePlane(id);
      //return { ...product, images: product.images.map((i) => i.url) };
    } catch (error) {
      this.handleException(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
    return product;
  }

  async removeAll() {
    try {
      const products = await this.productsRepository.find();
      await this.productsRepository.remove(products);
      return products;
    } catch (error) {
      this.handleException(error);
    }
  }

  async removeAllQB() {
    // igual al removeAll però utilitzant el QueryBuilder
    try {
      await this.productsRepository
        .createQueryBuilder()
        .delete()
        .from(Product)
        .execute();
    } catch (error) {
      this.handleException(error);
    }
  }

  private handleException(error: any) {
    this.logger.error(error);
    if (error.code === '23505') throw new BadRequestException(error.detail);
    throw new InternalServerErrorException('Unexpected error: ' + error.detail);
  }
}
