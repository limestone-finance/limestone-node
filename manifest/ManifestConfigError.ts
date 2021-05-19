//this error says that there is something wrong with node configuration
//(ie. manifest file) and we should stop immediately.
//note that error message should give user a hint what exactly is missing/wrong
//with the configuration
export default class ManifestConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ManifestConfigError";
  }
}
