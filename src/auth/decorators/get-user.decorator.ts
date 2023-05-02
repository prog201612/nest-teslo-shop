import { InternalServerErrorException } from '@nestjs/common';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator((data, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  if (!request.user)
    throw new InternalServerErrorException('No hi ha usuari a la request.');
  console.log(request.user);
  if (data === 'email') return request.user.email;
  return request.user;
});
