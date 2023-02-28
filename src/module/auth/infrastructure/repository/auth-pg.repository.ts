import {GenericRepositoryInterface} from '../../core/interface/generic-repository.interface';
import {AuthModel, AuthRoleEnum} from '../../core/model/auth.model';
import {AsyncReturn} from '@src-utility/utility';
import {IdentifierInterface} from '../../core/interface/identifier.interface';
import {DateTimeInterface} from '../../core/interface/date-time.interface';
import {AuthEntity} from '../entity/auth.entity';
import {Equal, FindManyOptions, Repository} from 'typeorm';
import {FilterModel, SortEnum} from '@src-utility/model/filter.model';
import {RepositoryException} from '../../core/exception/repository.exception';
import {Injectable} from '@nestjs/common';

@Injectable()
export class AuthPgRepository implements GenericRepositoryInterface<AuthModel> {
  constructor(
    private readonly _db: Repository<AuthEntity>,
    private readonly _identifier: IdentifierInterface,
    private readonly _date: DateTimeInterface,
  ) {
  }

  async getAll<F>(filter?: F): AsyncReturn<Error, Array<AuthModel>> {
    const findOptions: FindManyOptions<AuthEntity> = {order: {createAt: SortEnum.DESC}};

    if (filter) {
      const filterModel = <FilterModel<AuthModel>><any>filter;

      if (filterModel.getLengthOfCondition() > 0) {
        findOptions.where = [];

        const getUsername = filterModel.getCondition('username');
        if (getUsername && getUsername.opr === 'eq') {
          findOptions.where.push({username: Equal(getUsername.data)});
        }
      }
    }

    try {
      const [rows, count] = await this._db.findAndCount(findOptions);
      const result = rows.map((v) => AuthPgRepository._fillModel(v));

      return [null, result, count];
    } catch (error) {
      return [new RepositoryException(error)];
    }
  }

  private static _fillModel(entity: AuthEntity) {
    return new AuthModel({
      id: entity.id,
      username: entity.username,
      password: entity.password,
      salt: entity.salt,
      role: entity.role,
      createAt: entity.createAt,
    });
  }
}
