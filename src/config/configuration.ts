export interface MarvelConfig {
  api: string;
  publicKey: string;
  privateKey: string;
}

export default () => ({
  refreshHeroes: parseInt(process.env.REFRESH_HEROES) === 1,
  marvel: {
    privateKey: process.env.MARVEL_PRIVATE_KEY,
    publicKey: process.env.MARVEL_PUBLIC_KEY,
    api: process.env.MARVEL_API,
  },
});
