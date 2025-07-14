# API Setup Documentation

## CoinGecko API Integration

The application now uses real-time data from CoinGecko API for live crypto prices and market data.

### Environment Variables

Add the following to your `.env.local` file:

```bash
# CoinGecko API Key (Optional but recommended for better rate limits)
# Get your free API key from: https://www.coingecko.com/en/api/pricing
NEXT_PUBLIC_COINGECKO_API_KEY=your_coingecko_api_key_here
```

### API Endpoints

#### 1. Single Crypto Data

- **Endpoint**: `/api/crypto-data`
- **Parameters**:
  - `symbol`: Crypto symbol (BTC, ETH, SOL, etc.)
  - `orderBook`: Include order book data (true/false)
- **Example**: `/api/crypto-data?symbol=BTC&orderBook=true`

#### 2. Multiple Crypto Data

- **Endpoint**: `/api/crypto-data/multiple`
- **Parameters**:
  - `symbols`: Comma-separated list of crypto IDs
- **Example**: `/api/crypto-data/multiple?symbols=bitcoin,ethereum,solana`

#### 3. Exchange Rates

- **Endpoint**: `/api/exchange-rates`
- **Returns**: BTC, ETH, USDT rates in multiple fiat currencies

### Features

✅ **Real-time Price Updates**: Live data from CoinGecko API
✅ **Multiple Cryptocurrencies**: Support for BTC, ETH, SOL, BNB, ADA, DOT, LINK, LTC, BCH, XRP
✅ **Order Book Data**: Realistic order book generation
✅ **Error Handling**: Graceful fallback to cached data
✅ **Rate Limiting**: Proper API key usage for better limits
✅ **Caching**: 10-second cache for optimal performance

### Rate Limits

- **Free Tier**: 50 calls/minute
- **With API Key**: 1000 calls/minute
- **Caching**: 10-second cache reduces API calls

### Supported Cryptocurrencies

| Symbol | CoinGecko ID | Status |
| ------ | ------------ | ------ |
| BTC    | bitcoin      | ✅     |
| ETH    | ethereum     | ✅     |
| SOL    | solana       | ✅     |
| BNB    | binancecoin  | ✅     |
| ADA    | cardano      | ✅     |
| DOT    | polkadot     | ✅     |
| LINK   | chainlink    | ✅     |
| LTC    | litecoin     | ✅     |
| BCH    | bitcoin-cash | ✅     |
| XRP    | ripple       | ✅     |

### Usage in Components

The Header component now displays:

- Live Bitcoin price
- Real 24h price changes
- Live high/low prices
- Real trading volume
- Connection status indicator
- Data freshness indication
