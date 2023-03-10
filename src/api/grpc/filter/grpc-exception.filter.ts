import {
  ArgumentsHost,
  Catch,
  RpcExceptionFilter,
  UnprocessableEntityException,
} from '@nestjs/common';
import {Observable, throwError} from 'rxjs';
import {status, Metadata} from '@grpc/grpc-js';
import {NotFoundException} from '../../../module/auth/core/exception/not-found.exception';
import {AuthenticateException} from '../../../module/auth/core/exception/authenticate.exception';

export enum ExceptionEnum {
  UNPROCESSABLE_ENTITY_ERROR = 'UNPROCESSABLE_ENTITY_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

@Catch()
export class GrpcExceptionFilter<T> implements RpcExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): Observable<any> {
    const serverMetadata = new Metadata();

    if (exception instanceof UnprocessableEntityException) {
      serverMetadata.add('action', ExceptionEnum.UNPROCESSABLE_ENTITY_ERROR);
      serverMetadata.add('is-operation', '1');

      const message = <Array<string>><unknown>exception.getResponse()['message'] || [];
      serverMetadata.add('message-arr-len', message.length.toString());
      message.map((v, i) => serverMetadata.add(`message-${i}`, v));

      return throwError(() => ({
        code: status.INVALID_ARGUMENT,
        message: exception.message,
        metadata: serverMetadata,
      }));
    }

    let isOperation = false;
    if ('isOperation' in <Error><unknown>exception) {
      isOperation = exception['isOperation'];
    }

    if (!isOperation) {
      console.error(exception);
    }

    serverMetadata.add('action', exception['action'] || ExceptionEnum.UNKNOWN_ERROR);
    serverMetadata.add('is-operation', isOperation ? '1' : '0');

    let code;
    switch (true) {
      case exception instanceof AuthenticateException:
        code = status.UNAUTHENTICATED;
        break;
      case exception instanceof NotFoundException:
        code = status.NOT_FOUND;
        break;
      default:
        code = status.UNKNOWN;
    }

    return throwError(() => ({
      code: code,
      message: exception.message,
      details: exception.message,
      metadata: serverMetadata,
    }));
  }
}
