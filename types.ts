export interface PriceData {
  symbol: string,
  price: number,
};

export interface TokenConfig {
  symbol: string,
  source?: string[],
};

export interface Manifest {
  interval: number,
  source?: string[],
  tokens: TokenConfig[],
};
