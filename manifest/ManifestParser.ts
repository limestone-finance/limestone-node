import {Manifest, SourceTimeout} from "../types";

export type TokensBySource = { [source: string]: string[] };

export default class ManifestHelper {

  // This function converts tokens from manifest to object with the following
  // type: { <SourceName>: <Array of tokens to fetch from source> }
  static groupTokensBySource(manifest: Manifest): TokensBySource {
    const result: TokensBySource = {};

    for (const token in manifest.tokens) {
      const source = manifest.tokens[token].source;

      let sourcesForToken: string[];
      // If no source is defined for token
      // we use default source from manifest
      if (source === undefined || ! source.length) {
        if (manifest.defaultSource === undefined) {
          const errMsg =
            `Token source is not defined for "${token}"`
            + ` and global source is not defined`;
          throw new Error(errMsg);
        } else {
          sourcesForToken = manifest.defaultSource;
        }
      } else {
        sourcesForToken = source;
      }

      for (const singleSource of sourcesForToken) {
        if (result[singleSource]) {
          result[singleSource].push(token);
        } else {
          result[singleSource] = [token];
        }
      }
    }

    return result;
  }

  static getTimeoutForSource(source: string, manifest: Manifest): number | undefined {
    if (!source.length) {
      throw ('Source for timeout not defined');
    }
    const timeoutConfiguration: number | SourceTimeout | undefined = manifest.sourceTimeout;
    if (!timeoutConfiguration) {
      return undefined;
    }

    if (typeof(timeoutConfiguration) === 'number') {
      return timeoutConfiguration;
    }

    if (timeoutConfiguration.source[source] === undefined) {
      return timeoutConfiguration.default;
    }

    return timeoutConfiguration.source[source];
  }
}
