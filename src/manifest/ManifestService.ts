import ArweaveProxy from "../arweave/ArweaveProxy";
import {ArweaveTransactionTags, Manifest} from "../types";
import {Consola} from "consola";
import {JWKInterface} from "arweave/node/lib/wallet";
import {trackEnd, trackStart} from "../utils/performance-tracker";

const logger = require("../utils/logger")("ManifestService") as Consola;

export default class ManifestService {
  private arweaveProxy: ArweaveProxy;

  constructor(private jwk: JWKInterface) {
    this.arweaveProxy = new ArweaveProxy(jwk);
    this.waitForConfirmation = this.waitForConfirmation.bind(this);
  }

  async updateManifest(manifest: Manifest) {
    logger.info("Updating manifest");

    const tags: ArweaveTransactionTags = {
      app: "Redstone",
      type: "manifest",
      "Content-Type": "application/json",
      "Content-Encoding": "gzip",
      timestamp: String(Date.now()),
    };

    const transaction = await this.arweaveProxy.prepareUploadTransaction(
      tags, manifest);
    logger.info("Transaction: ", transaction)

    await this.arweaveProxy.postTransaction(transaction);
    logger.info("Transaction posted.");

    await this.waitForConfirmation(transaction.id);
  }

  private async waitForConfirmation(idTransaction: string) {
    const status = await this.arweaveProxy.transactionStatus(idTransaction);

    if (status.confirmed == null) {
      logger.info("Confirmation status: ", status);
      logger.info("Waiting another minute for confirming transaction");
      setTimeout(() => {
        this.waitForConfirmation(idTransaction);
      }, 60 * 1000);
    } else {
      //https://viewblock.io/arweave/tx/vlXsPzba_GWKFBQIoUPZVO8-pB-s0VJhqWqF4TA_YXw
      logger.info("Transaction confirmed: ", status);
      logger.info("You can now load manifest using transaction id: ", idTransaction);
      return status;
    }
  }

  async getCurrentManifest(idTransaction: string): Promise<Manifest> {
    trackStart("reading-manifest");
    const dataString = await this.arweaveProxy.getDataString(idTransaction);
    trackEnd("reading-manifest");

    return JSON.parse(dataString);
  }
}
