import {
  BadRequestException,
  Body,
  Controller,
  Delete,
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
import { ALLOWED_UPLOAD_FOLDERS } from './upload-folders';

/** 10 MB hard cap on direct uploads to avoid storage abuse / DoS. */
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

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
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_UPLOAD_BYTES } }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: string,
  ) {
    if (!file) throw new BadRequestException('Thiếu file');
    const resolvedFolder = folder ?? 'misc';
    if (!ALLOWED_UPLOAD_FOLDERS.includes(resolvedFolder as never)) {
      throw new BadRequestException('Thư mục upload không hợp lệ');
    }
    const result = await this.storage.upload(file.buffer, {
      folder: resolvedFolder,
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

  @Delete()
  @ApiOperation({
    summary: 'Xoá 1 object đã upload (dùng để rollback khi lưu metadata lỗi)',
  })
  async remove(@Body('key') key?: string) {
    if (!key) throw new BadRequestException('Thiếu key');
    // Only allow deleting within whitelisted folders, so a caller can't wipe
    // arbitrary objects in the bucket.
    const folder = key.split('/')[0];
    if (!ALLOWED_UPLOAD_FOLDERS.includes(folder as never)) {
      throw new BadRequestException('Key không hợp lệ');
    }
    await this.storage.delete(key);
    return { success: true };
  }
}
