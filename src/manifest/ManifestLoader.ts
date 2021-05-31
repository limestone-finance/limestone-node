import {Manifest} from "../types";

export default interface ManifestLoader {
  storeManifest(manifest: Manifest): Promise<void>;

  loadManifest(id: string): Promise<Manifest>;
}
