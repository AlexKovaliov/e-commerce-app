import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(user: CreateUserDto) {
    try {
      const newUser = this.userRepository.create(user);

      await this.userRepository.save(newUser);

      return newUser;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getUserById(id: string) {
    return await this.userRepository.findOne({
      where: { id },
      relations: { orders: true },
    });
  }

  async getUserByUsername(username: string) {
    return await this.userRepository.findOne({
      where: { username },
      relations: { orders: true },
    });
  }
}
