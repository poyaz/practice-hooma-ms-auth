import {BaseModel, ModelRequireProp} from '@src-utility/model/baseModel';
import {defaultModelFactory} from '@src-utility/model/defaultModelFactory';
import {DefaultPropertiesSymbol, IsDefaultSymbol} from '@src-utility/model/symbol';

export class AuthModel extends BaseModel<AuthModel> {
  id: string;
  username: string;
  password: string;
  role: string;
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
      role: 'default-role',
      createAt: new Date(),
      [IsDefaultSymbol]: true,
      [DefaultPropertiesSymbol]: ['id', 'username', 'password', 'role', 'createAt'],
    }));
  }
}
