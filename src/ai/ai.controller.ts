import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Injectable,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ChatMessageDto {
  @IsIn(['user', 'assistant'])
  role!: 'user' | 'assistant';

  @IsString()
  @MaxLength(8000)
  content!: string;
}

export class ChatDto {
  @IsArray()
  @ArrayMaxSize(40)
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages!: ChatMessageDto[];

  @IsString()
  @IsIn(['resident', 'admin'])
  scope: 'resident' | 'admin' = 'resident';
}

const SYSTEM_BY_SCOPE: Record<string, string> = {
  resident:
    'Bạn là trợ lý AI của ứng dụng quản lý chung cư "Nhà Chung", hỗ trợ cư dân. ' +
    'Trả lời ngắn gọn, thân thiện, bằng tiếng Việt. Hỗ trợ các câu hỏi về nội quy ' +
    'tòa nhà, phí dịch vụ, gửi xe, đăng ký thẻ từ, thủ tục cho người thân, tiện ích, ' +
    'và quy trình phản ánh. Nếu không chắc, hướng dẫn cư dân liên hệ Ban quản lý.',
  admin:
    'Bạn là trợ lý AI cho Ban quản trị chung cư "Nhà Chung". Trả lời ngắn gọn, ' +
    'chuyên nghiệp, bằng tiếng Việt. Hỗ trợ nghiệp vụ vận hành: quản lý cư dân, thu phí, ' +
    'thông báo, phản ánh, bảo trì, báo cáo. Đưa ra gợi ý thực tế, có cấu trúc.',
};

@Injectable()
export class AiService {
  constructor(private readonly config: ConfigService) {}

  async chat(dto: ChatDto): Promise<{ reply: string; degraded?: boolean }> {
    const apiKey = this.config.get<string>('ANTHROPIC_API_KEY');
    const model = this.config.get<string>('AI_MODEL', 'claude-opus-4-8');

    if (!apiKey) {
      return {
        reply:
          'Trợ lý AI chưa được cấu hình (thiếu ANTHROPIC_API_KEY). Vui lòng liên hệ ' +
          'Ban quản lý để được hỗ trợ trực tiếp.',
        degraded: true,
      };
    }

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model,
          max_tokens: 1024,
          system: SYSTEM_BY_SCOPE[dto.scope] ?? SYSTEM_BY_SCOPE.resident,
          messages: dto.messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        const detail = await res.text();
        throw new HttpException(
          `AI service error: ${res.status} ${detail.slice(0, 200)}`,
          HttpStatus.BAD_GATEWAY,
        );
      }

      const data = (await res.json()) as {
        content?: Array<{ type: string; text?: string }>;
      };
      const reply =
        data.content
          ?.filter((b) => b.type === 'text')
          .map((b) => b.text ?? '')
          .join('\n')
          .trim() || 'Xin lỗi, tôi chưa có câu trả lời cho câu hỏi này.';
      return { reply };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(
        'Không kết nối được dịch vụ AI. Vui lòng thử lại sau.',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}

@ApiTags('ai')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(private readonly service: AiService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Hỏi đáp với trợ lý AI (Claude)' })
  chat(@Body() dto: ChatDto) {
    return this.service.chat(dto);
  }
}
