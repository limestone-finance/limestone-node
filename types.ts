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
  keep: (price: PriceDataSigned) => Promise<PriceDataKeeped>,
};

export interface Broadcaster {
  broadcast: (price: PriceDataKeeped) => Promise<void>,
};

export interface PriceDataFetched {
  symbol: string,
  value: number,
};

export interface PriceDataBeforeAggregation {
  id: string,
  symbol: string,
  source: object,
  timestamp: number,
  version: string,
  provider: string,
};

export interface PriceDataAfterAggregation extends PriceDataBeforeAggregation {
  value: number,
};

export interface PriceDataSigned extends PriceDataAfterAggregation {
  signature: string,
};

export interface PriceDataKeeped extends PriceDataSigned {
  permawebTx: string,
};
