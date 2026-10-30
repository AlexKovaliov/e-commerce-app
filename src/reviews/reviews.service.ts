import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from '../orders/entities/order.entity';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { PaginationService } from '../common/pagination/pagination.service';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly reviewRepository: Repository<Review>,
    private readonly paginationService: PaginationService,
  ) {}

  async create(createReviewDto: CreateReviewDto) {
    try {
      const { productId, comment, rating } = createReviewDto;

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

      const order = this.reviewRepository.create({
        product,
        rating,
        comment,
      });
      await this.reviewRepository.save(order);

      return {
        message: 'Review created successfully',
        order,
      };
    } catch (error) {
      return {
        message: 'An error occurred!',
        error,
      };
    }
  }

  async getReviews(page = 1, limit = 10) {
    const totalItems = await this.reviewRepository.count();
    const meta = this.paginationService.getPaginationMeta(
      page,
      limit,
      totalItems,
    );

    const reviews = await this.reviewRepository.find({
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
      reviews,
      meta,
    };
  }

  async getReviewById(id: string) {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: {
        product: true,
        // customer: true, <-- Uncomment this after
        // creating the User entity
      },
    });

    return {
      review,
    };
  }
}
