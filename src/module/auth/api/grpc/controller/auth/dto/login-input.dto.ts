import {instanceToPlain} from 'class-transformer';
import {IsDefined, IsString, Matches, MaxLength, MinLength} from 'class-validator';
import {AuthModel} from '../../../../../core/model/auth.model';

export class LoginInputDto {
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @Matches(/^[a-zA-Z][a-zA-Z0-9_.-]+$/)
  @IsDefined()
  username: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @IsDefined()
  password: string;

  static toModel(dto: LoginInputDto): AuthModel {
    const data = AuthModel.getDefaultModel();
    data.username = dto.username;
    data.password = dto.password;

    return data;
  }
}
