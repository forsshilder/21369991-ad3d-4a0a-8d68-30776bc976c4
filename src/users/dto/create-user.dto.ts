import { IsString, IsEmail, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateUserDto {
  @IsString() name: string;

  @IsString() surname: string;

  @IsEmail() email: string;

  @IsString() password: string;

  @IsString() @IsOptional() phone?: string;

  @IsInt() @Min(0) @Max(150) age: number;

  @IsString() country: string;

  @IsString() district: string;

  @IsString() role: string;
}
