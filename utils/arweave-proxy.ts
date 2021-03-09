import Arweave from "arweave/node";
import Transaction from "arweave/node/lib/transaction";
import { JWKInterface } from "arweave/node/lib/wallet";
import _  from "lodash";
// import ARQL from "arql-ops";

// const LIME_TOKEN = "q2v4Msum6oeNRkSGfaM3E3RU6RCJ17T7Vm9ltMDEv4M";

export default class ArweaveProxy  {
  jwk: JWKInterface;
  arweave: Arweave;

  constructor(jwk: JWKInterface) {
    this.jwk = jwk;
    this.arweave = Arweave.init({
      host: 'arweave.net', // Hostname or IP address for a Arweave host
      port: 443,           // Port
      protocol: 'https',   // Network protocol http or https
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

  async upload(tags: any, data: object): Promise<string> {
    const uploadTx = await this.arweave.createTransaction({
      data: JSON.stringify(data),
    }, this.jwk);

    _.keys(tags).forEach((key) => {
      uploadTx.addTag(key, tags[key]);
    });

    await this.arweave.transactions.sign(uploadTx, this.jwk);

    // TODO: check if we must wait for this repsponse
    const response = await this.arweave.transactions.post(uploadTx);

    if (response.data) {
      console.log(response.data);
    }

    // TODO: remove
    console.log({response});

    // return response.data
    // return uploadTx;
    return "mock-tx-id";
  }

};
