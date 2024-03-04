import { IsString, MinLength } from 'class-validator';

export class ChatGptQuestionDto {
  @MinLength(1)
  @IsString()
  readonly question: string;
}
