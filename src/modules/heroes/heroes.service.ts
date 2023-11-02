import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MarvelConfig } from 'src/config/configuration';
import { createHash } from 'node:crypto';
import { PrismaService } from '../shared/prisma/prisma.service';
import { PaginationDto } from './dtos/pagination.dto';
import { PaginatedResult } from './interfaces/paginated';
import { Hero } from './interfaces/hero';

@Injectable()
export class HeroesService {
  private readonly marvel = Object.freeze(this.configService.getOrThrow<MarvelConfig>('marvel'));

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private prismaService: PrismaService,
  ) {}
  async findHeroes({ page }: PaginationDto): Promise<PaginatedResult<Hero>> {
    const limit = 100;
    const offset = page * limit;

    const url = `/v1/public/characters?limit=${limit}&offset=${offset}`;

    const cachedResponse = await this.prismaService.request.findUnique({
      where: { url },
    });

    if (cachedResponse) {
      if (typeof cachedResponse.content === 'string') {
        return JSON.parse(cachedResponse.content);
      } else {
        return cachedResponse.content as unknown as PaginatedResult<Hero>;
      }
    }

    const { privateKey, publicKey } = this.marvel;
    const ts = Date.now();
    const hash = createHash('md5').update(`${ts}${privateKey}${publicKey}`).digest('hex');
    const response = await this.httpService.axiosRef.get(
      `${url}&ts=${ts}&apikey=${publicKey}&hash=${hash}`,
    );

    if (response.data.data.results.length > 0) {
      await this.prismaService.request.create({
        data: {
          url,
          content: response.data.data,
        },
      });
    }

    return response.data.data;
  }
}
