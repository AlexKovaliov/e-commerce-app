import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal')
  rating: number;

  @Column('text')
  comment: string;

  @ManyToOne(() => Product, (product) => product.review)
  product: Product;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
