import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { PaginationService } from '../common/pagination/pagination.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly paginationService: PaginationService,
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
    const totalItems = await this.orderRepository.count();
    const meta = this.paginationService.getPaginationMeta(
      page,
      limit,
      totalItems,
    );

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
      meta,
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
