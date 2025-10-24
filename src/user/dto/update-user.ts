import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    last_name?: string;

    @IsString()
    @MinLength(6)
    @IsOptional()
    password?: string;

    @IsEnum(['male', 'female', 'other'])
    @IsOptional()
    gender?: string;

    @IsString()
    @IsOptional()
    phone_number?: string;
}
