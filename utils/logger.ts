import consola from "consola";

module.exports = (moduleName: string) => consola.create({
  // Here we can pass additional options for loger configuration

  // level: 4
  // reporters: [
  //   new (consola as any).JSONReporter(),
  //   new (consola as any).FancyReporter(),
  // ],
}).withTag(moduleName);
