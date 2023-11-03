import { MarvelContentItems } from './contentmarvel--items';
import { MarvelThumbnail } from './marvel-thumbnail';
import { MarvelUrl } from './marvel-url';

export interface MarvelHero {
  id: number;
  name: string;
  description: string;
  modified: string;
  thumbnail: MarvelThumbnail;
  resourceURI: string;
  comics: MarvelContentItems;
  series: MarvelContentItems;
  stories: MarvelContentItems;
  events: MarvelContentItems;
  urls: MarvelUrl[];
}
