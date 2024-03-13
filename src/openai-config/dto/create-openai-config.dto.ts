import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateOpenaiConfigDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  modelName?: string;

  @IsString()
  openAIApiKey: string;

  @IsNumber()
  @IsOptional()
  temperature?: number;

  @IsNumber()
  @IsOptional()
  maxTokens?: number;
}
