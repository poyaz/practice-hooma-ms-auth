import {Module} from '@nestjs/common';
import {AuthController} from './api/grpc/controller/auth/auth.controller';

@Module({
  controllers: [AuthController],
  providers: [],
})
export class AuthModule {
}
