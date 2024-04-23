import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  // SetMetadata,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { Auth, GetRawHeaders, GetUser, RoleProtected } from './decorators';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { ValidRoles } from './interfaces';

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
  // @SetMetadata('roles', ['admin', 'user'])

  @Get('private2')
  @RoleProtected(ValidRoles.user)
  @UseGuards(AuthGuard(), UserRoleGuard)
  textPrivateRoute2(@GetUser() user: User) {
    return { user };
  }

  @Get('private3')
  @Auth()
  textPrivateRoute3(@GetUser() user: User) {
    return { user };
  }
}
