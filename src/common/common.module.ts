import { Global, Module } from '@nestjs/common';
import { BuildingContextService } from './services/building-context.service';

@Global()
@Module({
  providers: [BuildingContextService],
  exports: [BuildingContextService],
})
export class CommonModule {}
