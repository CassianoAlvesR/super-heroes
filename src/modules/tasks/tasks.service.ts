import { Inject, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { DayjsService } from '../shared/dayjs/dayjs.module';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { Hero } from '@prisma/client';
import { MarvelService } from '../shared/marvel/marvel.service';

@Injectable()
export class TasksService implements OnApplicationBootstrap {
  private readonly logger = new Logger('Tasks');

  constructor(
    @Inject('DAYJS') private readonly dayjs: DayjsService,
    private readonly prismaService: PrismaService,
    private configService: ConfigService,
    private marvelService: MarvelService,
  ) {}

  async onApplicationBootstrap() {
    if (this.configService.get<boolean>('refreshHeroes')) {
      await this.updateHeroes();
    }
  }

  @Cron(CronExpression.EVERY_WEEK)
  private async updateHeroes(page = 0) {
    const marvelHeroes = await this.marvelService.fetchHeroes(page);

    if (!marvelHeroes.length) {
      this.logger.verbose('\nNo more heroes to save');
      return;
    }

    const savedHeroes = await this.prismaService.$transaction(
      async (transaction) => {
        const promises: Promise<Hero>[] = [];

        for (const marvelHero of marvelHeroes) {
          const createUrls = {
            create: marvelHero.urls.map((url) => ({
              type: url.type,
              url: url.url,
            })),
          };

          const createThumbnail = {
            create: {
              extension: marvelHero.thumbnail.extension,
              path: marvelHero.thumbnail.path,
            },
          };

          const createContent = (type: 'comics' | 'stories' | 'events' | 'series') => ({
            create: {
              contentItem: {
                create: {
                  available: marvelHero[type].available,
                  collectionURI: marvelHero[type].collectionURI,
                  returned: marvelHero[type].returned,
                  items: {
                    create: marvelHero[type].items.map((item) => ({
                      resourceURI: item.resourceURI,
                      name: item.name,
                      type: item.type,
                    })),
                  },
                },
              },
            },
          });

          const heroDetails = (() => {
            const modifiedDate = this.dayjs(marvelHero.modified);
            const isValid = modifiedDate.isValid();
            const modified = isValid ? modifiedDate.toDate() : null;
            return {
              name: marvelHero.name,
              description: marvelHero.description,
              resourceURI: marvelHero.resourceURI,
              modified,
            };
          })();

          promises.push(
            transaction.hero.upsert({
              where: {
                heroId: marvelHero.id,
              },
              create: {
                ...heroDetails,
                heroId: marvelHero.id,
                urls: createUrls,
                thumbnail: createThumbnail,
                comicContent: createContent('comics'),
                storyContent: createContent('stories'),
                eventContent: createContent('events'),
                serieContent: createContent('series'),
              },
              update: {
                ...heroDetails,
                urls: {
                  deleteMany: {},
                  ...createUrls,
                },
                thumbnail: {
                  delete: {},
                  ...createThumbnail,
                },
                comicContent: {
                  delete: {},
                  ...createContent('comics'),
                },
                storyContent: {
                  delete: {},
                  ...createContent('stories'),
                },
                eventContent: {
                  delete: {},
                  ...createContent('events'),
                },
                serieContent: {
                  delete: {},
                  ...createContent('series'),
                },
              },
            }),
          );
        }

        return await Promise.all(promises);
      },
      {
        maxWait: 1000 * 30,
        timeout: 1000 * 30,
      },
    );

    this.logger.log(
      `Saved ${savedHeroes.length} heroes: \n ${savedHeroes.map(({ name }) => name).join(', ')}`,
    );

    this.updateHeroes(page + 1);
  }
}
