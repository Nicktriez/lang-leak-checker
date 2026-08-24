declare module "nspell" {
  export default function nspell(aff: string, dic: string): Nspell;
  interface Nspell {
    correct(word: string): boolean;
  }
}