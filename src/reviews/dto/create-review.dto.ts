import {
  IsInt,
  IsPositive,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @IsString({ message: 'customerId must be a string' })
  // @IsUUID('all', { message: 'customerId must be a
  // valid UUID' })
  customerId: string;

  @IsString({ message: 'productId must be a string' })
  @IsUUID('all', { message: 'productId must be a valid UUID' })
  productId: string;

  @IsPositive({ message: 'quantity must be a positive number' })
  quantity: number;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @Length(2, 150)
  comment: string;
}
