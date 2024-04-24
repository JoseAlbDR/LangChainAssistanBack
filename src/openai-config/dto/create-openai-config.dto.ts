import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateOpenaiConfigDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  modelName?: string;

  @IsString()
  openAIApiKey?: string;

  @IsNumber({}, { message: 'La temperatur debe de ser un numero entre 0 y 1' })
  @IsOptional()
  @Min(0, { message: 'La temperatura mínima es 0' })
  @Max(1, { message: 'La temperatura máxima es 1' })
  temperature?: number;

  @IsNumber()
  @IsOptional()
  maxTokens?: number;
}
