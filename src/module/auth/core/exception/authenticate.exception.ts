import {ExceptionEnum} from './enum/exception.enum';

export class AuthenticateException extends Error {
  readonly action: string;
  readonly isOperation: boolean;

  constructor() {
    super('Authenticate error!');

    this.action = ExceptionEnum.AUTHENTICATE_ERROR;
    this.isOperation = true;
  }
}
