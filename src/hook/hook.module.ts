import { Module } from '@nestjs/common';
import { HookService } from '../hook/hook.service';

@Module({
  imports:[],
  controllers: [],
  providers: [HookService],
  exports:[]
})
export class HookModule {}