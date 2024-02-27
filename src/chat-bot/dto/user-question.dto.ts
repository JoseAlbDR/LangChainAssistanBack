import { IsString, MinLength } from 'class-validator';

export class UserQuestionDto {
  @MinLength(1)
  @IsString()
  question!: string;
}
