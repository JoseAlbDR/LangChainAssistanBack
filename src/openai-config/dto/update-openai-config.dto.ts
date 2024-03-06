import { PartialType } from '@nestjs/mapped-types';
import { CreateOpenaiConfigDto } from './create-openai-config.dto';

export class UpdateOpenaiConfigDto extends PartialType(CreateOpenaiConfigDto) {}
