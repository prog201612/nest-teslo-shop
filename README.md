# Inici

## Instal·lació
```bash
nest new teslo-shop
cd teslo-shop
yarn install
yarn dlx @yarnpkg/sdks vscode
code .
yarn start:dev

# Variables d'entorn
yarn add @nestjs/config

# TypeORM + Postgres
yarn add @nestjs/typeorm typeorm pg

# Validacions
yarn add class-validator class-transformer
```

## Aixecar la BD
Omplim les variables d'entorn al .env
```bash
docker-compose up -d
```

## Configuració variables entorn i bd
Fitxer app.module.ts
```typescript
@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      //entities: [__dirname + '/**/*.entity{.ts,.js}'],
      autoLoadEntities: true,
      synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true', // no en producción. Sincronitza els canvis d'entitats
    }),
  ],
})
export class AppModule {}
```

## Validacions i ruta de la api
Al fitxer main.ts afegim:
```typescript
app.setGlobalPrefix('api');
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true, // transformar informació dels DTO's
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
);
```

## Seed
Podem executar un seed per reinicialitzar la base de dades a la url:
http://localhost:3000/api/seed 

# NestJS

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
