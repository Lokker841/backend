import { ApiProperty } from '@nestjs/swagger';

export class TableDataDto {
  @ApiProperty({ type: [String] })
  columns: string[];

  @ApiProperty({ type: 'array', items: { type: 'object', additionalProperties: true } })
  rows: Record<string, any>[];
}

export class CreateRecordDto {
  @ApiProperty({ type: 'object', additionalProperties: true })
  data: Record<string, any>;
}

export class UpdateRecordDto {
  @ApiProperty({ type: 'object', additionalProperties: true })
  data: Record<string, any>;
}

export class TableParamDto {
  @ApiProperty()
  table: string;
}

export class IdParamDto {
  @ApiProperty()
  id: number;
} 