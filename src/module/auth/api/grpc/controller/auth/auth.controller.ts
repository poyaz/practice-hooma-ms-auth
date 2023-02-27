import {Controller, Inject} from '@nestjs/common';
import {AUTH_SERVICE_NAME, LoginResponse} from './auth.pb';
import {GrpcMethod} from '@nestjs/microservices';
import {ProviderEnum} from '../../../enum/provider.enum';
import {LoginInputDto} from './dto/login-input.dto';
import {AuthServiceInterface} from '../../../../core/interface/auth-service.interface';
import {AsyncReturn} from '@src-utility/utility';


@Controller()
export class AuthController {
  constructor(
    @Inject(ProviderEnum.AUTH_SERVICE)
    private readonly _authService: AuthServiceInterface,
  ) {
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'Login')
  async login(payload: LoginInputDto): Promise<LoginResponse> {
    const [error, data] = await this._authService.generateToken(LoginInputDto.toModel(payload));
    if (error) {
      throw error;
    }


    return {status: 'success', token: data};
  }
}
