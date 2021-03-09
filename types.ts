export interface Manifest {
  interval: number,
  priceAggregator: string,
  defaultSource?: string[],
  tokens: { [symbol: string]: TokenConfig },
};

export interface TokenConfig {
  source?: string[],
};

export interface Fetcher {
  fetchAll: (tokenSymbols: string[]) => Promise<PriceDataFetched[]>,
};

export interface Aggregator {
  getAggregatedValue:
    (price: PriceDataBeforeAggregation) => PriceDataAfterAggregation;
};

export interface Keeper {
  keep: (prices: PriceDataSigned[]) => Promise<TransactionId>,
};

export interface Broadcaster {
  broadcast: (prices: PriceDataSigned[],
              permawebTx: TransactionId,
              provider: string) => Promise<void>,
};

export type TransactionId = string;

export interface PriceDataFetched {
  symbol: string,
  value: number,
};

export interface PriceDataBeforeAggregation {
  id: string,
  symbol: string,
  source: { [sourceName: string]: number },
  timestamp: number,
  version: string,
};

export interface PriceDataAfterAggregation extends PriceDataBeforeAggregation {
  value: number,
};

export interface PriceDataSigned extends PriceDataAfterAggregation {
  signature: string,
};
