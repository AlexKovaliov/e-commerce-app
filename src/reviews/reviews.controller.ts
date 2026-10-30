import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('create')
  create(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(createReviewDto);
  }

  @Get()
  getReviews(@Body() dto: { page?: number; limit?: number }) {
    return this.reviewsService.getReviews(dto?.page, dto?.limit);
  }

  @Get(':id')
  getReviewById(@Param('id') id: string) {
    return this.reviewsService.getReviewById(id);
  }
}
