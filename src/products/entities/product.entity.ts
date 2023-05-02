import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/auth/entities/user.entity';
import { ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';
import { ProductImage } from './product-image.entity';

@Entity()
export class Product {
  @ApiProperty({ type: 'string', format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('text', { unique: true })
  title: string;

  @ApiProperty()
  @Column('float', { default: 0 }) // number no és suportat per postgres
  price: number;

  @ApiProperty()
  @Column({ type: 'text', nullable: true }) // una altra sintaxi
  description: string;

  @ApiProperty()
  @Column('text', { unique: true })
  slug: string;

  @ApiProperty()
  @Column('int', { default: 0 })
  stock: number;

  @ApiProperty()
  @Column('text', { array: true, default: '{}' })
  sizes: string[];

  @ApiProperty()
  @Column('text')
  gender: string;

  @ApiProperty()
  @Column('text', { array: true, default: '{}' })
  tags: string[];

  @ApiProperty()
  @OneToMany(() => ProductImage, (image) => image.product, {
    cascade: true,
    eager: true,
  })
  images?: ProductImage[];

  @ManyToOne(() => User, (user) => user.products, {
    onDelete: 'CASCADE',
    eager: true, // carrègui automàticament aquesta relació
  })
  owner: User;

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
