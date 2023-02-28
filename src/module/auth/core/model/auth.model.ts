import {BaseModel, ModelRequireProp} from '@src-utility/model/baseModel';
import {defaultModelFactory} from '@src-utility/model/defaultModelFactory';
import {DefaultPropertiesSymbol, IsDefaultSymbol} from '@src-utility/model/symbol';

export enum AuthRoleEnum {
  ADMIN = 'admin',
  USER = 'user',
}

export class AuthModel extends BaseModel<AuthModel> {
  id: string;
  username: string;
  password: string;
  salt: string;
  role: AuthRoleEnum;
  createAt: Date;

  constructor(props: ModelRequireProp<AuthModel>) {
    super();

    Object.assign(this, props);
  }

  static getDefaultModel(): AuthModel {
    return defaultModelFactory<AuthModel>(new AuthModel({
      id: 'default-id',
      username: 'default-username',
      password: 'default-password',
      salt: 'default-salt',
      role: AuthRoleEnum.USER,
      createAt: new Date(),
      [IsDefaultSymbol]: true,
      [DefaultPropertiesSymbol]: ['id', 'username', 'password', 'salt', 'role', 'createAt'],
    }));
  }
}
