import { Controller, Get, Param, Query } from '@nestjs/common';
import { HeroesService } from './heroes.service';
import { GetInfoDto } from './dtos/getinfo.dto';

@Controller('heroes')
export class HeroesController {
  constructor(private heroesService: HeroesService) {}

  @Get(':id')
  findHeroById(@Param('id') id: string, @Query() { type }: GetInfoDto) {
    return this.heroesService.getHeroInfo(id, type);
  }

  @Get()
  findHeroes() {
    return this.heroesService.getHeroes();
  }
}
