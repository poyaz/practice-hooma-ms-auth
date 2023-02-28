import {Injectable} from '@nestjs/common';
import {AuthServiceInterface} from '../interface/auth-service.interface';
import {GenericRepositoryInterface} from '../interface/generic-repository.interface';
import {AuthModel} from '../model/auth.model';
import {AsyncReturn} from '@src-utility/utility';
import {JwtService} from '@nestjs/jwt';
import {FilterModel} from '@src-utility/model/filter.model';
import {AuthenticateException} from '../exception/authenticate.exception';
import {NotFoundException} from '../exception/not-found.exception';
import * as bcrypt from 'bcrypt';
import {DefaultPropertiesSymbol, IsDefaultSymbol} from '@src-utility/model/symbol';

@Injectable()
export class AuthService implements AuthServiceInterface {
  constructor(
    private readonly _authRepository: GenericRepositoryInterface<AuthModel>,
    private readonly _jwtService: JwtService,
  ) {
  }

  async generateToken(model: AuthModel): AsyncReturn<Error, string> {
    const userFilter = new FilterModel<AuthModel>();
    userFilter.addCondition({opr: 'eq', path: 'username', data: model.username});

    const [userError, userData, userCount] = await this._authRepository.getAll(userFilter);
    if (userError) {
      return [userError];
    }
    if (userCount === 0) {
      return [new NotFoundException()];
    }

    const userAuth = userData[0];
    const password = await bcrypt.hash(model.password, userAuth.salt);
    if (userAuth.password !== password) {
      return [new AuthenticateException()];
    }

    const obj = {
      userId: userAuth.id,
      role: userAuth.role,
    };
    const token = this._jwtService.sign(obj);

    return [null, token];
  }
}
