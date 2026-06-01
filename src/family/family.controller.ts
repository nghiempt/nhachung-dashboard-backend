import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FamilyService } from './family.service';
import { FamilyMemberDto } from './dto/family-member.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('family')
@ApiBearerAuth()
@Controller('family')
export class FamilyController {
  constructor(private readonly service: FamilyService) {}

  @Get()
  @ApiOperation({ summary: 'Thành viên gia đình (stats + danh sách)' })
  list(
    @CurrentUser('accountId') accountId: string,
    @Query('buildingId') buildingId?: string,
  ) {
    return this.service.list(accountId, buildingId);
  }

  @Post()
  @ApiOperation({ summary: 'Thêm thành viên gia đình' })
  create(
    @CurrentUser('accountId') accountId: string,
    @Body() dto: FamilyMemberDto,
  ) {
    return this.service.create(accountId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thành viên gia đình' })
  update(
    @CurrentUser('accountId') accountId: string,
    @Param('id') id: string,
    @Body() dto: FamilyMemberDto,
  ) {
    return this.service.update(accountId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa thành viên gia đình' })
  remove(
    @CurrentUser('accountId') accountId: string,
    @Param('id') id: string,
  ) {
    return this.service.remove(accountId, id);
  }
}
