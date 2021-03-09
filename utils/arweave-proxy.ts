import Arweave from "arweave/node";
import { JWKInterface } from "arweave/node/lib/wallet";
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
    console.log({strToSign});
    const dataToSign: Uint8Array = new TextEncoder().encode(strToSign);
    console.log({dataToSign});
    const signature = await this.arweave.crypto.sign(this.jwk, dataToSign);
    console.log({signature});
    const buffer = Buffer.from(signature);
    return buffer.toString("base64");
  }

  async getAddress(): Promise<string> {
    return await this.arweave.wallets.jwkToAddress(this.jwk);
  }

};
