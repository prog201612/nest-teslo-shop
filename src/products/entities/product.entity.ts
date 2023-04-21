import { OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';
import { ProductImage } from './product-image.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  title: string;

  @Column('float', { default: 0 }) // number no és suportat per postgres
  price: number;

  @Column({ type: 'text', nullable: true }) // una altra sintaxi
  description: string;

  @Column('text', { unique: true })
  slug: string;

  @Column('int', { default: 0 })
  stock: number;

  @Column('text', { array: true, default: '{}' })
  sizes: string[];

  @Column('text')
  gender: string;

  @Column('text', { array: true, default: '{}' })
  tags: string[];

  @OneToMany(() => ProductImage, (image) => image.product, {
    cascade: true,
    eager: true,
  })
  images?: ProductImage[];

  // Aquests decoradors funcionen si s'utilitza el .save() de Repository
  @BeforeInsert()
  @BeforeUpdate()
  checkSlug() {
    if (!this.slug) {
      this.slug = this.title;
    }
    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '-')
      .replaceAll("'", '');
    console.log('this.slug', this.slug);
  }
}
