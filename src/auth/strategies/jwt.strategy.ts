import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    configService: ConfigService,
  ) {
    // PassportStrategy requireix que cridem al super() amb una configuració
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // header auth bearer token
      secretOrKey: configService.get<string>('JWT_SECRET'),
      // ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    // validate, es crida si la firma del token es correcte i la fetxa de caducitat no ha expirat
    // si el token existeix vol dir que l'usuari es va autenticar anteriorment.
    const { id } = payload;
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new UnauthorizedException('Invalid token');
    if (!user.isActive)
      throw new UnauthorizedException('Invalid token, user is not active');

    // El retorn s'afegeix al Request, per tant, el podrem utilitzar a qualsevol controlador
    return user;
  }
}
