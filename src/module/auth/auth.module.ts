import {Module} from '@nestjs/common';
import {AuthController} from './api/grpc/controller/auth/auth.controller';
import {ProviderEnum} from './api/enum/provider.enum';
import {AuthPgRepository} from './infrastructure/repository/auth-pg.repository';
import {UuidIdentifier} from './infrastructure/system/uuid-identifier';
import {DateTime} from './infrastructure/system/date-time';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {AuthEntity} from './infrastructure/entity/auth.entity';
import {getRepositoryToken, TypeOrmModule} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {IdentifierInterface} from './core/interface/identifier.interface';
import {DateTimeInterface} from './core/interface/date-time.interface';
import {AuthService} from './core/service/auth.service';
import {GenericRepositoryInterface} from './core/interface/generic-repository.interface';
import {AuthModel} from './core/model/auth.model';
import {JwtService} from '@nestjs/jwt';
import {AuthServiceInterface} from './core/interface/auth-service.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthEntity]),
  ],
  controllers: [AuthController],
  providers: [
    ConfigService,
    JwtService,
    {
      provide: ProviderEnum.AUTH_SERVICE,
      inject: [AuthService],
      useFactory: (authService: AuthServiceInterface) => {
        return authService;
      },
    },
    {
      provide: AuthService,
      inject: [AuthPgRepository, JwtService],
      useFactory: (authPgRepository: GenericRepositoryInterface<AuthModel>, jwtService: JwtService) => {
        return new AuthService(authPgRepository, jwtService);
      },
    },
    {
      provide: AuthPgRepository,
      inject: [
        getRepositoryToken(AuthEntity),
        UuidIdentifier,
        DateTime,
      ],
      useFactory: (db: Repository<AuthEntity>, identifier: IdentifierInterface, dateTime: DateTimeInterface) => {
        return new AuthPgRepository(db, identifier, dateTime);
      },
    },
    {
      provide: UuidIdentifier,
      inject: [],
      useFactory: () => new UuidIdentifier(),
    },
    {
      provide: DateTime,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const tzConfig = configService.get<string>('TZ');
        if (!tzConfig) {
          return new DateTime();
        }

        return new DateTime('en', tzConfig);
      },
    },
  ],
})
export class AuthModule {
}
