import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';

export class QueryEventsDto {
  @ApiPropertyOptional({ description: 'Override active building' })
  @IsOptional()
  @IsString()
  buildingId?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo tháng (YYYY-MM) dựa trên startAt',
    example: '2026-05',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}$/, { message: 'month phải có định dạng YYYY-MM' })
  month?: string;

  @ApiPropertyOptional({
    description: 'Chỉ lấy sự kiện sắp diễn ra (startAt >= now)',
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  upcoming?: boolean;
}
