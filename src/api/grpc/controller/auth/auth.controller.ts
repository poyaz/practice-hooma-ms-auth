import {Controller} from '@nestjs/common';
import {AUTH_SERVICE_NAME} from './auth.pb';
import {GrpcMethod} from '@nestjs/microservices';
import {LoginInputDto} from '@src-api/grpc/controller/auth/dto/login-input.dto';
import {Metadata, ServerUnaryCall} from '@grpc/grpc-js';

@Controller()
export class AuthController {
  @GrpcMethod(AUTH_SERVICE_NAME, 'Login')
  async login(payload: LoginInputDto) {
    return {status: 'success', token: 'token'};
  }
}
