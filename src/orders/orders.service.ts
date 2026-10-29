import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    try {
      const { productId, quantity, totalPrice } = createOrderDto;

      const product = await this.productRepository.findOne({
        where: {
          id: productId,
        },
      });

      if (!product) {
        return {
          message: 'Product not found!',
        };
      }

      const order = this.orderRepository.create({
        product,
        quantity,
        totalPrice,
      });
      await this.orderRepository.save(order);

      return {
        message: 'Order created successfully',
        order,
      };
    } catch (error) {
      return {
        message: 'An error occurred!',
        error,
      };
    }
  }

  async getOrders(page = 1, limit = 10) {
    const orders = await this.orderRepository.find({
      skip: (page - 1) * limit,
      take: limit,
      relations: {
        product: true,
        // customer: true, <-- Uncomment this after
        // creating the User entity
      },
      select: {
        product: {
          name: true,
          price: true,
          image: true,
        },
      },
    });

    return {
      orders,
    };
  }

  async getOrderById(id: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: {
        product: true,
        // customer: true, <-- Uncomment this after
        // creating the User entity
      },
    });

    return {
      order,
    };
  }
}
