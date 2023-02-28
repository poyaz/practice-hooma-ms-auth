import {AuthPgRepository} from './auth-pg.repository';
import {Test, TestingModule} from '@nestjs/testing';
import {DateTimeInterface} from '../../core/interface/date-time.interface';
import {IdentifierInterface} from '../../core/interface/identifier.interface';
import {AuthEntity} from '../entity/auth.entity';
import {Equal, FindManyOptions, Repository} from 'typeorm';
import {mock, MockProxy} from 'jest-mock-extended';
import {FilterModel, SortEnum} from '@src-utility/model/filter.model';
import {AuthModel, AuthRoleEnum} from '../../core/model/auth.model';
import {RepositoryException} from '../../core/exception/repository.exception';
import {DefaultPropertiesSymbol, IsDefaultSymbol} from '@src-utility/model/symbol';

describe('AuthPgRepository', () => {
  let repository: AuthPgRepository;
  let authDb: MockProxy<Repository<AuthEntity>>;
  let identifier: MockProxy<IdentifierInterface>;
  let dateTime: MockProxy<DateTimeInterface>;
  const defaultDate = new Date('2020-01-01');

  beforeEach(async () => {
    const authDbProvider = 'AUTH_DB';
    authDb = mock<Repository<AuthEntity>>();

    const identifierProvider = 'IDENTIFIER';
    identifier = mock<IdentifierInterface>();
    identifier.generateId.mockReturnValue('00000000-0000-0000-0000-000000000000');

    const dateTimeProvider = 'DATE_TIME';
    dateTime = mock<DateTimeInterface>();
    dateTime.gregorianCurrentDateWithTimezone.mockReturnValue(defaultDate);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: authDbProvider,
          useValue: authDb,
        },
        {
          provide: identifierProvider,
          useValue: identifier,
        },
        {
          provide: dateTimeProvider,
          useValue: dateTime,
        },
        {
          provide: AuthPgRepository,
          inject: [authDbProvider, identifierProvider, dateTimeProvider],
          useFactory: (
            authDb: Repository<AuthEntity>,
            identifier: IdentifierInterface,
            dateTimeProvider: DateTimeInterface,
          ) => new AuthPgRepository(authDb, identifier, dateTimeProvider),
        },
      ],
    }).compile();

    repository = module.get<AuthPgRepository>(AuthPgRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe(`getAll`, () => {
    let usernameFilter: string;
    let inputUsernameFilter: FilterModel<AuthModel>;
    let outputAuthEntity: AuthEntity;

    beforeEach(() => {
      usernameFilter = 'username';

      inputUsernameFilter = new FilterModel<AuthModel>();
      inputUsernameFilter.addCondition({opr: 'eq', path: 'username', data: usernameFilter});

      outputAuthEntity = new AuthEntity();
      outputAuthEntity.id = identifier.generateId();
      outputAuthEntity.username = 'username';
      outputAuthEntity.password = 'password';
      outputAuthEntity.salt = 'salt';
      outputAuthEntity.role = AuthRoleEnum.USER;
      outputAuthEntity.createAt = defaultDate;
      outputAuthEntity.updateAt = null;
    });

    it(`Should error get all users (without filter)`, async () => {
      const executeError = new Error('Error in create on database');
      authDb.findAndCount.mockRejectedValue(executeError);

      const [error] = await repository.getAll();

      expect(authDb.findAndCount).toHaveBeenCalled();
      expect(authDb.findAndCount).toBeCalledWith(expect.objectContaining(<FindManyOptions<AuthEntity>>{
        order: {createAt: SortEnum.DESC},
      }));
      expect(error).toBeInstanceOf(RepositoryException);
      expect((<RepositoryException>error).cause).toEqual(executeError);
    });

    it(`Should error get all users (with filter)`, async () => {
      const executeError = new Error('Error in create on database');
      authDb.findAndCount.mockRejectedValue(executeError);

      const [error] = await repository.getAll(inputUsernameFilter);

      expect(authDb.findAndCount).toHaveBeenCalled();
      expect(authDb.findAndCount).toBeCalledWith(expect.objectContaining(<FindManyOptions<AuthEntity>>{
        where: [{username: Equal(usernameFilter)}],
        order: {createAt: SortEnum.DESC},
      }));
      expect(error).toBeInstanceOf(RepositoryException);
      expect((<RepositoryException>error).cause).toEqual(executeError);
    });

    it(`Should successfully get all users (with filter) and return empty records`, async () => {
      authDb.findAndCount.mockResolvedValue([[], 0]);

      const [error, result, total] = await repository.getAll(inputUsernameFilter);

      expect(authDb.findAndCount).toHaveBeenCalled();
      expect(authDb.findAndCount).toBeCalledWith(expect.objectContaining(<FindManyOptions<AuthEntity>>{
        where: [{username: Equal(usernameFilter)}],
        order: {createAt: SortEnum.DESC},
      }));
      expect(error).toBeNull();
      expect(result.length).toEqual(0);
      expect(total).toEqual(0);
    });

    it(`Should successfully get all users (with filter)`, async () => {
      authDb.findAndCount.mockResolvedValue([[outputAuthEntity], 1]);

      const [error, result, total] = await repository.getAll(inputUsernameFilter);

      expect(authDb.findAndCount).toHaveBeenCalled();
      expect(authDb.findAndCount).toBeCalledWith(expect.objectContaining(<FindManyOptions<AuthEntity>>{
        where: [{username: Equal(usernameFilter)}],
        order: {createAt: SortEnum.DESC},
      }));
      expect(error).toBeNull();
      expect(result.length).toEqual(1);
      expect(result[0]).toMatchObject<Omit<AuthModel, 'clone' | typeof IsDefaultSymbol | typeof DefaultPropertiesSymbol>>({
        id: identifier.generateId(),
        username: outputAuthEntity.username,
        password: outputAuthEntity.password,
        salt: outputAuthEntity.salt,
        role: AuthRoleEnum.USER,
        createAt: defaultDate,
      });
      expect(total).toEqual(1);
    });
  });
});
