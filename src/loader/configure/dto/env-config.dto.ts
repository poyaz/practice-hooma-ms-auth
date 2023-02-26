import {IsDefined, IsEnum, IsIn, IsNumber, IsOptional, IsString, IsUrl} from 'class-validator';
import {EnvironmentEnv} from '@src-loader/configure/enum/environment.env';
import {Transform} from 'class-transformer';

export class EnvConfigDto {
  @IsOptional()
  @IsString()
  TZ?: string;

  @IsOptional()
  @IsEnum(EnvironmentEnv)
  @Transform(param => param.value.toLowerCase())
  NODE_ENV?: EnvironmentEnv;

  @IsOptional()
  @IsString()
  SERVER_HOST?: string;

  @IsOptional()
  @IsNumber()
  SERVER_GRPC_PORT?: number;

  @IsOptional()
  @IsString()
  JWT_ALGORITHM_TYPE?: string;

  @IsDefined()
  @IsString()
  JWT_PUBLIC_KEY_FILE: string;

  @IsDefined()
  @IsString()
  JWT_PRIVATE_KEY_FILE: string;

  @IsOptional()
  @IsString()
  JWT_EXPIRE_TIME?: string;
}


