import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { Review } from '../../reviews/entities/review.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  name: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 5, default: 0 })
  price: number;

  @Column('text', { default: 'no-image.png' })
  image: string;

  @Column('simple-json', {
    default: {},
    comment: "a key-value pair that represents the product's specs",
  })
  specs: Record<string, string>;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @OneToMany(() => Order, (order) => order.product)
  orders: Order[];

  @OneToMany(() => Review, (order) => order.product)
  review: Review[];

  // @ManyToOne(() => User, (user) => user.orders)
  // customer: User;
}
