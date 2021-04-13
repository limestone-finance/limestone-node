const axios = require("axios");
const { gzip, gunzipSync, deflateSync, unzipSync } = require('zlib');
const _ = require("lodash");

main();

const compressions = {
  deflate: {
    compress(data) {
      return deflateSync(data);
    },

    decompress(data) {
      return unzipSync(data);
    },
  },

  gzip: {
    async compress(data) {
      return await new Promise((resolve, reject) => {
        gzip(data, (err, res) => {
          if (err) {
            reject(err);
          } else {
            resolve(res);
          }
        });
      });
    },

    async decompress(data) {
      return gunzipSync(data);
    },
  }
};

async function main() {
  const prices = await getAllPrices();
  for (const price of prices) {
    await testCompressions(price);
  }
}

async function testDeflateCompression(price) {
  const bytesInitial = Buffer.from(price.signature, "utf8");
  const initialSize = bytesInitial.length;

  const bytes2 = Buffer.from(price.signature, "base64");
  const size2 = bytes2.length;

  const bytes3 = await compressions.gzip.compress(bytes2);
  const size3 = bytes3.length;
  const bytes4 = await compressions.gzip.decompress(bytes3);

  if (Buffer.compare(bytes2, bytes4) !== 0) {
    throw new Error("Decompressed value and precompressed value differ");
  }

  console.log({
    initialSize,
    size2,
    size3,
  });
}

async function testCompressions(price) {
  const bytesInitial = Buffer.from(price.signature, "utf8");
  const initialSize = bytesInitial.length;

  const pureBytes = Buffer.from(price.signature, "base64");
  const pureBytesSize = pureBytes.length;

  // Gzip compression
  const gzipCompressedBytes = await compressions.gzip.compress(pureBytes);
  const gzipCompressedBytesSize = gzipCompressedBytes.length;
  const gzipDecompressedBytes =
    await compressions.gzip.decompress(gzipCompressedBytes);
  if (Buffer.compare(pureBytes, gzipDecompressedBytes) !== 0) {
    throw new Error(
      "Gzip decompressed value and precompressed value differ");
  }

  // Deflate compression
  const deflateCompressedBytes = compressions.deflate.compress(pureBytes);
  const deflateCompressedBytesSize = deflateCompressedBytes.length;
  const deflateDecompressedBytes =
    compressions.deflate.decompress(deflateCompressedBytes);
  if (Buffer.compare(pureBytes, deflateDecompressedBytes) !== 0) {
    throw new Error(
      "Deflate decompressed value and precompressed value differ");
  }


  console.log({
    initialSize,
    pureBytesSize,
    gzipCompressedBytesSize,
    deflateCompressedBytesSize,
  });
}

async function getAllPrices() {
  const response = await axios.get("https://api.limestone.finance/prices", {
    params: { provider: "limestone" },
  });
  return _.values(response.data);
}
