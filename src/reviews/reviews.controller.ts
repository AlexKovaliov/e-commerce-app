import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(AuthGuard)
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
