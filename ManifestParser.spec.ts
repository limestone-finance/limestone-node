import ManifestHelper from "./ManifestParser";
import { Manifest } from "./types";

const baseManifest = {
  interval: 2000,
  priceAggregator: 'median'
}

it('should properly assign tokens to sources', () => {
  //given
  const manifest: Manifest = {
    ...baseManifest,
    tokens: {
      "BTC": {
        "source": [
          "bitfinex",
          "ftx"
        ]
      },
      "ETH": {
        "source": [
          "binance",
          "bitfinex"
        ]
      },
      "USDT": {
        "source": [
          "ftx",
          "binance"
        ]
      }
    }
  };

  //when
  const result = ManifestHelper.groupTokensBySource(manifest);

  //then
  expect(result).toEqual({
    "bitfinex": ["BTC", "ETH"],
    "ftx": ["BTC", "USDT"],
    "binance": ["ETH", "USDT"]
  });
});

it('should use default source, if no source for given token is defined', () => {
  //given
  const manifest: Manifest = {
    ...baseManifest,
    defaultSource: ["kraken"],
    tokens: {
      "BTC": {
        "source": [
          "bitfinex",
          "ftx"
        ]
      },
      "ETH": {
      },
      "USDT": {
        "source": [
          "ftx"
        ]
      }
    }
  };

  //when
  const result = ManifestHelper.groupTokensBySource(manifest);

  //then
  expect(result).toEqual({
    "bitfinex": ["BTC"],
    "kraken": ["ETH"],
    "ftx": ["BTC", "USDT"]
  });
});

it('should use default source if token has defined empty source', () => {
  //given
  const manifest: Manifest = {
    ...baseManifest,
    defaultSource: ["kraken"],
    tokens: {
      "BTC": {
        "source": [
          "bitfinex",
          "ftx"
        ]
      },
      "ETH": {
        "source": []
      },
      "USDT": {
        "source": [
          "ftx"
        ]
      }
    }
  };

  //when
  const result = ManifestHelper.groupTokensBySource(manifest);

  //then
  expect(result).toEqual({
    "bitfinex": ["BTC"],
    "kraken": ["ETH"],
    "ftx": ["BTC", "USDT"]
  });
});

it('should throw error if neither source for token nor default source are defined', () => {
  //given
  const manifest: Manifest = {
    ...baseManifest,
    tokens: {
      "ETH": {
      },
      "USDT": {
        "source": [
          "ftx"
        ]
      }
    }
  };
  //when

  //then
  expect(() => ManifestHelper.groupTokensBySource(manifest)).toThrow(/global source is not defined/);
});