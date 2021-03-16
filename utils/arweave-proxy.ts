import Arweave from "arweave/node";
import Transaction from "arweave/node/lib/transaction";
import { JWKInterface } from "arweave/node/lib/wallet";
import _  from "lodash";

export default class ArweaveProxy  {
  jwk: JWKInterface;
  arweave: Arweave;

  constructor(jwk: JWKInterface) {
    this.jwk = jwk;
    this.arweave = Arweave.init({
      host: "arweave.net", // Hostname or IP address for a Arweave host
      port: 443,           // Port
      protocol: "https",   // Network protocol http or https
      timeout: 60000,      // Network request timeouts in milliseconds
      logging: false,      // Enable network request logging
    });
  }

  async sign(strToSign: string): Promise<string> {
    // TODO: check alternative method
    // crypto module is marked as deprecated
    const dataToSign: Uint8Array = new TextEncoder().encode(strToSign);
    const signature = await this.arweave.crypto.sign(this.jwk, dataToSign);
    const buffer = Buffer.from(signature);

    return buffer.toString("base64");
  }

  async getAddress(): Promise<string> {
    return await this.arweave.wallets.jwkToAddress(this.jwk);
  }

  async getBalance(): Promise<number> {
    let address = await this.getAddress();
    let rawBalance = await this.arweave.wallets.getBalance(address);
    return parseFloat(this.arweave.ar.winstonToAr(rawBalance));
  }

  // This method creates and signs arweave transaction
  // It doesn't post transaction to arweave, to do so use postTransaction
  async prepareUploadTransaction(tags: any, data: any): Promise<Transaction> {
    const uploadTx = await this.arweave.createTransaction({
      data: JSON.stringify(data),
    }, this.jwk);

    _.keys(tags).forEach((key) => {
      uploadTx.addTag(key, tags[key]);
    });

    // Transaction id is generated during signing
    await this.arweave.transactions.sign(uploadTx, this.jwk);

    return uploadTx;
  }

  async postTransaction(tx: Transaction): Promise<void> {
    const response = await this.arweave.transactions.post(tx);
    console.log({ response }); // <- TODO: maybe this logging should be removed
  }

};
