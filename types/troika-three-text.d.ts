// troika-three-text ships without types; declare only what the site uses.
declare module "troika-three-text" {
  export function configureTextBuilder(config: {
    /** base URL for the unicode fallback font resolver (defaults to a public CDN) */
    unicodeFontsURL?: string | null;
    sdfGlyphSize?: number;
    useWorker?: boolean;
  }): void;
}
