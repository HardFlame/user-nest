import { IsEmail, IsNotEmpty, IsString, IsArray } from 'class-validator';
import { Roles } from 'src/generated/prisma/enums';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class userInJwtDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  id: number | string;

  @IsArray({
    each: true,
  })
  roles: Roles[];
}
