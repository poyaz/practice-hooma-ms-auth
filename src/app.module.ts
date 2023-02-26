import {Logger, Module} from '@nestjs/common';
import {AuthController} from './api/grpc/controller/auth/auth.controller';
import {ConfigureModule} from '@src-loader/configure/configure.module';
import {ConfigService} from '@nestjs/config';
import {LoggerModule} from 'nestjs-pino';
import {APP_FILTER} from '@nestjs/core';
import {ValidateExceptionFilter} from '@src-api/grpc/filter/validate-exception.filter';

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
  ],
  controllers: [AuthController],
  providers: [
    Logger,
    ConfigService,

    {
      provide: APP_FILTER,
      useClass: ValidateExceptionFilter,
    },
  ],
})
export class AppModule {
}
