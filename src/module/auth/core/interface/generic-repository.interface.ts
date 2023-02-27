import {AsyncReturn} from '@src-utility/utility';

export interface GenericRepositoryInterface<T> {
  getAll<F>(filter?: F): AsyncReturn<Error, Array<T>>;
}
