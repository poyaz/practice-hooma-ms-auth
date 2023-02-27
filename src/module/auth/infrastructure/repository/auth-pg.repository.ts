import {GenericRepositoryInterface} from '../../core/interface/generic-repository.interface';
import {AuthModel} from '../../core/model/auth.model';
import {AsyncReturn} from '@src-utility/utility';
import {IdentifierInterface} from '../../core/interface/identifier.interface';
import {DateTimeInterface} from '../../core/interface/date-time.interface';
import {AuthEntity} from '../entity/auth.entity';
import {FindManyOptions, Repository} from 'typeorm';
import {SortEnum} from '@src-utility/model/filter.model';

export class AuthPgRepository implements GenericRepositoryInterface<AuthModel> {
  constructor(
    private readonly _db: Repository<AuthEntity>,
    private readonly _identifier: IdentifierInterface,
    private readonly _date: DateTimeInterface,
  ) {
  }

  async getAll<F>(filter?: F): AsyncReturn<Error, Array<AuthModel>> {
    const findOptions: FindManyOptions<AuthModel> = {order: {createAt: SortEnum.DESC}};

    return Promise.resolve(undefined);
  }
}
