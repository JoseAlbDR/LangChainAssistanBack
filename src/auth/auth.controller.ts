import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { GetRawHeaders, GetUser } from './decorators';
import { UserRoleGuard } from './guards/user-role/user-role.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testPrivateRoute(
    @GetUser() user: User,
    @GetUser('email') email: string,
    @GetRawHeaders() rawHeaders: string[],
  ) {
    return { ok: true, message: 'private test', user, email, rawHeaders };
  }

  @Get('private2')
  @SetMetadata('roles', ['admin', 'user'])
  @UseGuards(AuthGuard(), UserRoleGuard)
  textPrivateRoute2(@GetUser() user: User) {
    return { user };
  }
}
