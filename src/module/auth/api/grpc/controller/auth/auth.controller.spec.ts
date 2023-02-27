import {Test, TestingModule} from '@nestjs/testing';
import {AuthController} from './auth.controller';
import {ProviderEnum} from '../../../enum/provider.enum';
import {AuthServiceInterface} from '../../../../core/interface/auth-service.interface';
import {mock, MockProxy} from 'jest-mock-extended';
import {LoginInputDto} from './dto/login-input.dto';
import {AuthModel} from '../../../../core/model/auth.model';
import {LoginResponse} from './auth.pb';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: MockProxy<AuthServiceInterface>;

  beforeEach(async () => {
    authService = mock<AuthServiceInterface>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: ProviderEnum.AUTH_SERVICE,
          useValue: authService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe(`login`, () => {
    let payload: LoginInputDto;

    beforeEach(() => {
      payload = new LoginInputDto();
      payload.username = 'username';
      payload.password = 'password';
    });

    it(`Should error login user`, async () => {
      authService.generateToken.mockResolvedValue([new Error('fail')]);

      let error;
      try {
        await controller.login(payload);
      } catch (err) {
        error = err;
      }

      expect(authService.generateToken).toHaveBeenCalled();
      expect(authService.generateToken).toHaveBeenCalledWith(expect.objectContaining<Pick<AuthModel, 'username' | 'password'>>({
        username: payload.username,
        password: payload.password,
      }));
      expect(error).toBeInstanceOf(Error);
    });

    it(`Should successfully login user`, async () => {
      const token = 'user-token';
      authService.generateToken.mockResolvedValue([null, token]);

      let error;
      let result;
      try {
        result = await controller.login(payload);
      } catch (err) {
        error = err;
      }

      expect(authService.generateToken).toHaveBeenCalled();
      expect(authService.generateToken).toHaveBeenCalledWith(expect.objectContaining<Pick<AuthModel, 'username' | 'password'>>({
        username: payload.username,
        password: payload.password,
      }));
      expect(error).toBeUndefined();
      expect(result).toMatchObject<LoginResponse>({
        status: 'success',
        token,
      });
    });
  });
});
