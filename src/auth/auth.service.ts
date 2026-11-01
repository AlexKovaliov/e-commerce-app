import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(username: string, password: string) {
    try {
      const user = await this.userService.getUserByUsername(username);

      if (!user) {
        return {
          message: 'Invalid username or password',
          data: null,
        };
      }

      if (await this.verifyPassword(user, password, user.password)) {
        const { password: _password, ...userWithoutPassword } = user;

        const accessToken = await this.jwtService.signAsync({
          sub: user.id,
          username: user.username,
          role: user.role,
        });

        return {
          message: 'Login successful',
          data: {
            ...userWithoutPassword,
            accessToken,
          },
        };
      }

      return {
        message: 'Invalid username or password',
        data: null,
      };
    } catch (error) {
      return error;
    }
  }

  async signup(createUserDto: CreateUserDto) {
    try {
      const hashedPassword = this.hashPassword(createUserDto.password);
      const newUser: CreateUserDto = {
        ...createUserDto,
        password: hashedPassword,
      };

      return await this.userService.create(newUser);
    } catch (error) {
      return error;
    }
  }

  hashPassword(password: string) {
    return bcrypt.hashSync(password, 10);
  }

  async verifyPassword(user: User, password: string, hashedPassword: string) {
    return user && (await bcrypt.compare(password, hashedPassword));
  }
}
