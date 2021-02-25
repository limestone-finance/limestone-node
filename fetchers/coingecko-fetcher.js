const CoinGecko = require('coingecko-api');

const CoinGeckoClient = new CoinGecko();

const symbolToId = {
  "BTC": "bitcoin",
  "ETH": "ethereum",
  "BNB": "binancecoin",
  "USDT": "tether",
  "ADA": "cardano",
  "DOT": "polkadot",
  "XRP": "ripple",
  "LTC": "litecoin",
  "LINK": "chainlink",
  "BCH": "bitcoin-cash",
  "XLM": "stellar",
  "USDC": "usd-coin",
  "UNI": "uniswap",
  "DOGE": "dogecoin",
  "WBTC": "wrapped-bitcoin",
  "OKB": "okb",
  "XEM": "nem",
  "AAVE": "aave",
  "ATOM": "cosmos",
  "SOL": "solana",
  "CRO": "crypto-com-chain",
  "EOS": "eos",
  "XMR": "monero",
  "BSV": "bitcoin-cash-sv",
  "TRX": "tron",
  "HT": "huobi-token",
  "MIOTA": "iota",
  "THETA": "theta-token",
  "SNX": "havven",
  "NEO": "neo",
  "LUNA": "terra-luna",
  "XTZ": "tezos",
  "VET": "vechain",
  "FTT": "ftx-token",
  "DASH": "dash",
  "GRT": "the-graph",
  "DAI": "dai",
  "AVAX": "avalanche-2",
  "BUSD": "binance-usd",
  "CDAI": "cdai",
  "KSM": "kusama",
  "SUSHI": "sushi",
  "MKR": "maker",
  "CETH": "compound-ether",
  "EGLD": "elrond-erd-2",
  "FIL": "filecoin",
  "FTM": "fantom",
  "CEL": "celsius-degree-token",
  "LEO": "leo-token",
  "COMP": "compound-governance-token",
  "DCR": "decred",
  "CUSDC": "compound-usd-coin",
  "CAKE": "pancakeswap-token",
  "VGX": "ethos",
  "RVN": "ravencoin",
  "ZEC": "zcash",
  "ZIL": "zilliqa",
  "ETC": "ethereum-classic",
  "UMA": "uma",
  "NEXO": "nexo",
  "YFI": "yearn-finance",
  "HBTC": "huobi-btc",
  "RUNE": "thorchain",
  "NEAR": "near",
  "ZRX": "0x",
  "REN": "republic-protocol",
  "WAVES": "waves",
  "ICX": "icon",
  "XSUSHI": "xsushi",
  "STX": "blockstack",
  "HBAR": "hedera-hashgraph",
  "AMP": "amp-token",
  "MATIC": "matic-network",
  "BTT": "bittorrent-2",
  "MDX": "mdex",
  "RENBTC": "renbtc",
  "CHSB": "swissborg",
  "IOST": "iostoken",
  "ALGO": "algorand",
  "PAX": "paxos-standard",
  "DGB": "digibyte",
  "ONT": "ontology",
  "NANO": "nano",
  "BAT": "basic-attention-token",
  "LRC": "loopring",
  "ZKS": "zkswap",
  "OMG": "omisego",
  "HUSD": "husd",
  "BNT": "bancor",
  "UST": "terrausd",
  "ZEN": "zencash",
  "QTUM": "qtum",
  "NPXS": "pundi-x",
  "HOT": "holotoken",
  "ENJ": "enjincoin",
  "XVS": "venus",
  "BTMX": "bmax",
  "CRV": "curve-dao-token",
  "SC": "siacoin",
  "BTG": "bitcoin-gold"
};

async function fetch(symbol) {
  const response = await CoinGeckoClient.coins.fetch(symbolToId[symbol], {
    ico_data: false,
    community_data: false,
    developer_data: false,
    localization: false,
    tickers: false
  });
  return response.data.market_data.current_price.usd;
};

async function fetchAll(tokenSymbols) {
  const ids = tokenSymbols.map((symbol) => symbolToId[symbol]);
  const response = await CoinGeckoClient.coins.markets({
    ids,
    per_page: 1000,
    localization: false,
  });
  
  return response.data.map(coin => {
    return {
      symbol: coin.symbol,
      price: coin.current_price,
    };
  });
}

//EXPORTS:

module.exports = {
  fetch,
  fetchAll,
};
