import {
  ArgumentsHost,
  Catch,
  RpcExceptionFilter,
  UnprocessableEntityException,
} from '@nestjs/common';
import {Observable, throwError} from 'rxjs';
import {status, Metadata} from '@grpc/grpc-js';
import {ExceptionEnum} from '@src-core/exception/enum/exception.enum';

@Catch()
export class ValidateExceptionFilter<T> implements RpcExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): Observable<any> {
    const serverMetadata = new Metadata();

    if (exception instanceof UnprocessableEntityException) {
      serverMetadata.add('action', ExceptionEnum.UNPROCESSABLE_ENTITY);
      serverMetadata.add('isOperation', '1');
      (<Array<string>><unknown>exception.getResponse()['message'] || []).map((v) => serverMetadata.add('message', v));

      return throwError(() => ({
        code: status.INVALID_ARGUMENT,
        message: exception.message,
        metadata: serverMetadata,
      }));
    }

    serverMetadata.add('action', ExceptionEnum.UNKNOWN_ERROR);

    return throwError(() => ({
      code: status.UNKNOWN,
      message: exception.message,
      details: '123',
      metadata: serverMetadata,
    }));
  }
}
