import { Module } from '@nestjs/common';
import { HeroesModule } from './modules/heroes/heroes.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    HeroesModule,
  ],
})
export class AppModule {}
