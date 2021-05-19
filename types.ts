import Transaction from "arweave/node/lib/transaction";
import ArweaveProxy from "./utils/arweave-proxy";

//I would move each interface to a separate file..
export interface Manifest {
  interval: number;
  priceAggregator: string;
  defaultSource?: string[];
  sourceTimeout?: number | SourceTimeout;
  tokens: { [symbol: string]: TokenConfig };
};

export interface SourceTimeout {
  default: number;
  source: { [symbol: string]: number };
};

export interface Credentials {
  infuraProjectId?: string;
  covalentApiKey?: string;
};

//not sure if this interface is necessary...
export interface TokenConfig {
  source?: string[];
};

export interface Fetcher {
  fetchAll: (
    tokens: string[],
    opts?: {
      credentials: Credentials;
    }) => Promise<PriceDataFetched[]>;
};

export interface Aggregator {
  getAggregatedValue:
    (price: PriceDataBeforeAggregation) => PriceDataAfterAggregation;
};

//dlaczego akurat 'Keeper'?
export interface Keeper {
  prepareTransaction: (
    prices: PriceDataAfterAggregation[],
    version: string,
    arweaveProxy: ArweaveProxy) => Promise<Transaction>;
};

export interface Broadcaster {
  broadcast: (prices: PriceDataSigned[]) => Promise<void>;
};

export interface PriceDataFetched {
  symbol: string; //symbol or token?
  value: number;
};

export interface PriceDataBeforeAggregation {
  id: string;
  symbol: string; //token or symbol or symbolToken? :-)
  source: { [sourceName: string]: number };
  timestamp: number;
  version: string;
};

export interface PriceDataAfterAggregation extends PriceDataBeforeAggregation {
  value: number; //TODO: rename to "aggregatedValue"?
};

export interface PriceDataBeforeSigning extends PriceDataAfterAggregation {
  permawebTx: string;
  provider: string;
};

export interface PriceDataSigned extends PriceDataBeforeSigning {
  signature: string;
};

export interface ArweaveTransactionTags {
  [tag: string]: string,
};
