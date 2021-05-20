import Transaction from "arweave/node/lib/transaction";
import ArweaveProxy from "./arweave/ArweaveProxy";

export interface Manifest {
  interval: number;
  priceAggregator: string;
  defaultSource?: string[];
  sourceTimeout: number;
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
  symbol: string;
  value: number;
};

export interface PriceDataBeforeAggregation {
  id: string;
  symbol: string;
  source: { [sourceName: string]: number };
  timestamp: number;
  version: string;
};

export interface PriceDataAfterAggregation extends PriceDataBeforeAggregation {
  value: number;
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

export interface NodeConfig {
  arweaveKeysFile: string,
  manifestFile: string,
  minimumArBalance: number,
  credentials: Credentials
}
