import {AsyncReturn} from '@src-utility/utility';
import {AuthModel} from '../model/auth.model';

export interface AuthServiceInterface {
  generateToken(model: AuthModel): AsyncReturn<Error, string>;
}
