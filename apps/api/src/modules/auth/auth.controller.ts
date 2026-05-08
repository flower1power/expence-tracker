import { Controller, Post, Body } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RegisterCommand, LoginCommand } from './commands';

@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.commandBus.execute(new RegisterCommand(dto.email, dto.name, dto.password));
  }

  @Post('login')
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.commandBus.execute(new LoginCommand(dto.email, dto.password));
  }
}
