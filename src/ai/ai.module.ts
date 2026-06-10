import { Module } from '@nestjs/common';
import { AiController, AiService } from './ai.controller';

@Module({
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
