import { IsString, IsEmail, IsOptional, IsInt, Min, Max } from 'class-validator';

export class UpdateUserDto {
  @IsString() @IsOptional() name?: string;

  @IsString() @IsOptional() surname?: string;

  @IsEmail() @IsOptional() email?: string;

  @IsString() @IsOptional() password?: string;

  @IsString() @IsOptional() phone?: string;

  @IsInt() @Min(0) @Max(120) @IsOptional() age?: number;

  @IsString() @IsOptional() country?: string;

  @IsString() @IsOptional() district?: string;

  @IsString() @IsOptional() role?: string;
}
