import { Delete, Req, UseGuards, Headers, SetMetadata } from '@nestjs/common';
import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { IncomingHttpHeaders } from 'http';
import { AuthService } from './auth.service';
import { Auth } from './decorators/auth.decorator';
import { GetUser } from './decorators/get-user.decorator';
import { RoleProtected } from './decorators/role-protected.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { ValidRoles } from './interfaces/valid-roles.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  login(@Body() createUserDto: CreateUserDto) {
    return this.authService.login(createUserDto);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    @GetUser() user: User,
    @GetUser('email') email: string,
    @Headers() headers: IncomingHttpHeaders,
  ) {
    console.log(headers);
    return { ok: true, email, user };
  }

  @Get('private2')
  @RoleProtected(ValidRoles.ADMIN, ValidRoles.SUPERADMIN)
  @UseGuards(AuthGuard(), UserRoleGuard) // no cal fer new UserRoleGuard(). Es crearia una nova instància cada petició.
  authorizationRoute() {
    return { ok: true, message: 'You are authorized' };
  }

  @Get('private3')
  @Auth(ValidRoles.ADMIN, ValidRoles.SUPERADMIN)
  authRouteOneDecorator() {
    return { ok: true, message: 'You are authorized' };
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }
}
