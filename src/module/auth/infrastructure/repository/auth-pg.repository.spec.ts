import {AuthPgRepository} from './auth-pg.repository';
import {Test, TestingModule} from '@nestjs/testing';
import {DateTimeInterface} from '../../core/interface/date-time.interface';
import {IdentifierInterface} from '../../core/interface/identifier.interface';
import {AuthEntity} from '../entity/auth.entity';
import {Repository} from 'typeorm';
import {mock, MockProxy} from 'jest-mock-extended';
import {FilterModel} from '@src-utility/model/filter.model';
import {AuthModel} from '../../core/model/auth.model';

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

    beforeEach(() => {
      usernameFilter = 'username';

      inputUsernameFilter = new FilterModel<AuthModel>();
      inputUsernameFilter.addCondition({opr: 'eq', path: 'username', data: usernameFilter});
    });
  });
});
