import { Consola } from "consola";
import keepers from "./keepers";
import { PriceDataAfterAggregation, PriceDataBeforeSigning, PriceDataSigned } from "./types";
import ArweaveProxy from "./utils/arweave-proxy";
import { trackEnd, trackStart } from "./utils/performance-tracker";
import Transaction from "arweave/node/lib/transaction";

const logger = require("./utils/logger")("ArweaveService") as Consola;
const deepSortObject = require("deep-sort-object");

export type BalanceCheckResult = { balance: number, isBalanceLow: boolean }

export default class ArweaveService {

  constructor(
    private arweave: ArweaveProxy,
    private version: string,
    private minBalance: number
  ) { }

  async prepareArweaweTransaction(prices: PriceDataAfterAggregation[])
    : Promise<Transaction> {
    trackStart("transaction-preparing");

    logger.info("Keeping prices on arweave blockchain - preparing transaction");
    const { prepareTransaction } = keepers.basic; //why 'basic'? any example of 'non-basic'?
    const transaction: Transaction =
      await prepareTransaction(prices, this.version, this.arweave);
    trackEnd("transaction-preparing");

    return transaction;
  }

  async checkBalance(): Promise<BalanceCheckResult> {
    const balance = await this.arweave.getBalance();
    const isBalanceLow = balance < this.minBalance;
    logger.info(`Balance: ${balance}`);

    return { balance, isBalanceLow };
  }

  async storePricesOnArweave(arTransaction: Transaction) {
    // Posting prices data on arweave blockchain
    logger.info(
      "Keeping prices on arweave blockchain - posting transaction "
      + arTransaction.id);
    trackStart("keeping");
    //TODO: errors handling? retries? (!!!)
    await this.arweave.postTransaction(arTransaction);
    trackEnd("keeping");
    logger.info(`Transaction posted: ${arTransaction.id}`);
  }

  async signPrices(
    prices: PriceDataAfterAggregation[],
    idArTransaction: string,
    providerAddress: string
  ): Promise<PriceDataSigned[]> {
    trackStart("signing");
    const signedPrices: PriceDataSigned[] = [];

    //shouldn't this be done in parallel (similar to how fetchPrices is handled)?
    for (const price of prices) {
      // Signing price data
      logger.info(`Signing price: ${price.id}`);

      const signed: PriceDataSigned = await this.signPrice({
        ...price,
        permawebTx: idArTransaction,
        provider: providerAddress,
      });

      signedPrices.push(signed);
    }
    trackEnd("signing");

    return signedPrices;
  }

  private async signPrice(price: PriceDataBeforeSigning): Promise<PriceDataSigned> {
    const priceWithSortedProps = deepSortObject(price);
    const priceStringified = JSON.stringify(priceWithSortedProps);
    const signature = await this.arweave.sign(priceStringified);

    return {
      ...price,
      signature,
    };
  }
}