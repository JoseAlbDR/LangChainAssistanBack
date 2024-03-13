import { Transform } from 'class-transformer';
import { IsNumber, Max, Min } from 'class-validator';

export class DocumentOptionsDto {
  @IsNumber()
  @Min(0)
  @Max(5000)
  @Transform(({ value }) => parseInt(value), { toClassOnly: true })
  chunkSize: number;

  @IsNumber()
  @Min(0)
  @Max(5000)
  @Transform(({ value }) => parseInt(value), { toClassOnly: true })
  chunkOverlap: number;
}
