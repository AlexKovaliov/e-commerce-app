import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationService } from '../common/pagination/pagination.service';
import { CommonModule } from '../common/common.module';
import { Product } from '../products/entities/product.entity';
import { Review } from './entities/review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Product]), CommonModule],
  controllers: [ReviewsController],
  providers: [ReviewsService, PaginationService],
})
export class ReviewsModule {}
