import {Test, TestingModule} from '@nestjs/testing';
import {AuthService} from './auth.service';
import {mock, MockProxy} from 'jest-mock-extended';
import {GenericRepositoryInterface} from '../interface/generic-repository.interface';
import {AuthModel, AuthRoleEnum} from '../model/auth.model';
import {JwtService} from '@nestjs/jwt';
import {FilterModel} from '@src-utility/model/filter.model';
import {NotFoundException} from '../exception/not-found.exception';
import {AuthenticateException} from '../exception/authenticate.exception';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let authRepository: MockProxy<GenericRepositoryInterface<AuthModel>>;
  let jwtService: MockProxy<JwtService>;

  beforeEach(async () => {
    const authRepositoryProvider = 'AUTH_REPOSITORY';
    authRepository = mock<GenericRepositoryInterface<AuthModel>>();

    const jwtServiceProvider = 'JWT_SERVICE';
    jwtService = mock<JwtService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: authRepositoryProvider,
          useValue: authRepository,
        },
        {
          provide: jwtServiceProvider,
          useValue: jwtService,
        },
        {
          provide: AuthService,
          inject: [authRepositoryProvider, jwtServiceProvider],
          useFactory: (
            authRepository: GenericRepositoryInterface<AuthModel>,
            jwtService: JwtService,
          ) => new AuthService(authRepository, jwtService),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe(`generateToken`, () => {
    let inputModel: AuthModel;
    let filterMatch: FilterModel<AuthModel>;
    let passwordSalt: string;
    let outputUserAndPassInvalid: AuthModel;
    let outputUserAndPassValid: AuthModel;
    let outputToken: string;

    beforeEach(async () => {
      inputModel = AuthModel.getDefaultModel();
      inputModel.username = 'username';
      inputModel.password = 'password';

      filterMatch = new FilterModel<AuthModel>();
      filterMatch.addCondition({opr: 'eq', path: 'username', data: inputModel.username});

      passwordSalt = await bcrypt.genSalt(10);

      outputUserAndPassInvalid = AuthModel.getDefaultModel();
      outputUserAndPassInvalid.username = inputModel.username;
      outputUserAndPassInvalid.password = 'invalid-password';
      outputUserAndPassInvalid.salt = passwordSalt;

      outputUserAndPassValid = AuthModel.getDefaultModel();
      outputUserAndPassValid.id = 'id';
      outputUserAndPassValid.username = inputModel.username;
      outputUserAndPassValid.password = await bcrypt.hash(inputModel.password, passwordSalt);
      outputUserAndPassValid.salt = passwordSalt;
      outputUserAndPassValid.role = AuthRoleEnum.ADMIN;

      outputToken = 'signed-token';
    });

    it(`Should error generate token when fetch username`, async () => {
      const errorFetchAuth = new Error('fail fetch auth');
      authRepository.getAll.mockResolvedValue([errorFetchAuth]);

      const [error] = await service.generateToken(inputModel);

      expect(authRepository.getAll).toHaveBeenCalled();
      expect(authRepository.getAll).toHaveBeenCalledWith(filterMatch);
      expect(error).toBeInstanceOf(Error);
      expect(error).toEqual(errorFetchAuth);
    });

    it(`Should error generate token when username not found`, async () => {
      authRepository.getAll.mockResolvedValue([null, [], 0]);

      const [error] = await service.generateToken(inputModel);

      expect(authRepository.getAll).toHaveBeenCalled();
      expect(authRepository.getAll).toHaveBeenCalledWith(filterMatch);
      expect(error).toBeInstanceOf(NotFoundException);
    });

    it(`Should error generate token when auth failed`, async () => {
      authRepository.getAll.mockResolvedValue([null, [outputUserAndPassInvalid], 1]);

      const [error] = await service.generateToken(inputModel);

      expect(authRepository.getAll).toHaveBeenCalled();
      expect(authRepository.getAll).toHaveBeenCalledWith(filterMatch);
      expect(error).toBeInstanceOf(AuthenticateException);
    });

    it(`Should successfully generate token`, async () => {
      authRepository.getAll.mockResolvedValue([null, [outputUserAndPassValid], 1]);
      jwtService.sign.mockReturnValue(outputToken);

      const [error, result] = await service.generateToken(inputModel);

      expect(authRepository.getAll).toHaveBeenCalled();
      expect(authRepository.getAll).toHaveBeenCalledWith(filterMatch);
      expect(jwtService.sign).toHaveBeenCalled();
      expect(jwtService.sign).toHaveBeenCalledWith(expect.objectContaining({
        userId: outputUserAndPassValid.id,
        role: outputUserAndPassValid.role,
      }));
      expect(error).toBeNull();
      expect(result).toEqual(outputToken);
    });
  });
});
