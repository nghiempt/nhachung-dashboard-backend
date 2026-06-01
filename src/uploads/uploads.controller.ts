import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { nanoid } from 'nanoid';
import { StorageService } from '../storage/storage.service';
import { PresignDto } from './dto/presign.dto';

@ApiTags('uploads')
@ApiBearerAuth()
@Controller('uploads')
export class UploadsController {
  constructor(private readonly storage: StorageService) {}

  @Post()
  @ApiOperation({ summary: 'Upload trực tiếp 1 file (multipart) -> trả public URL' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        folder: { type: 'string' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: string,
  ) {
    if (!file) throw new BadRequestException('Thiếu file');
    const result = await this.storage.upload(file.buffer, {
      folder: folder ?? 'misc',
      filename: file.originalname,
      contentType: file.mimetype,
    });
    return {
      url: result.url,
      key: result.key,
      name: file.originalname,
      sizeBytes: file.size,
      contentType: file.mimetype,
    };
  }

  @Post('presign')
  @ApiOperation({ summary: 'Lấy presigned PUT URL để FE upload thẳng lên MinIO' })
  async presign(@Body() dto: PresignDto) {
    const safeName = dto.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `${(dto.folder ?? 'misc').replace(/^\/|\/$/g, '')}/${nanoid()}-${safeName}`;
    return this.storage.presignUpload(key, dto.contentType);
  }
}
