import {Logger, Module} from '@nestjs/common';
import {ConfigureModule} from '@src-loader/configure/configure.module';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {LoggerModule} from 'nestjs-pino';
import {APP_FILTER} from '@nestjs/core';
import {PgModule} from '@src-loader/database/pg.module';
import {TypeOrmModule} from '@nestjs/typeorm';
import {PgConfigService} from '@src-loader/database/pg-config.service';
import {AuthModule} from './module/auth/auth.module';
import {GrpcExceptionFilter} from './api/grpc/filter/grpc-exception.filter';

@Module({
  imports: [
    ConfigureModule,
    LoggerModule.forRoot({
      pinoHttp: {
        autoLogging: false,
        genReqId: () => null,
        quietReqLogger: false,
        transport: {target: 'pino-pretty'},
      },
    }),

    PgModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useClass: PgConfigService,
    }),
    TypeOrmModule.forFeature([]),
    AuthModule,
  ],
  controllers: [],
  providers: [
    Logger,
    ConfigService,

    {
      provide: APP_FILTER,
      useClass: GrpcExceptionFilter,
    },
  ],
})
export class AppModule {
}
