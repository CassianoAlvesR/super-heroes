import { MarvelItem } from './marvel-item';

export interface MarvelContentItems {
  available: number;
  collectionURI: string;
  items: MarvelItem[];
  returned: number;
}
