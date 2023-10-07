export interface MarvelConfig {
  api: string;
  publicKey: string;
  privateKey: string;
}

export default () => ({
  marvel: {
    privateKey: process.env.MARVEL_PRIVATE_KEY,
    publicKey: process.env.MARVEL_PUBLIC_KEY,
    api: process.env.MARVEL_API,
  },
});
