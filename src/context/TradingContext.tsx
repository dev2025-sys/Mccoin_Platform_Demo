"use client";
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from "react";
import { v4 as uuidv4 } from "uuid";

// Types
export interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  timestamp: number;
}

export interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

export interface Order {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  type: "limit" | "market";
  amount: number;
  price: number;
  status: "pending" | "filled" | "cancelled";
  timestamp: number;
}

export interface Portfolio {
  balances: Record<string, number>;
  totalValue: number;
}

export interface Transaction {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  amount: number;
  price: number;
  fee: number;
  timestamp: number;
}

// New interface for on-hold amounts
export interface OnHoldBalances {
  USDT: number;
  BTC: number;
  ETH: number;
  BNB: number;
}

interface TradingState {
  currentPrice: PriceData;
  orderBook: {
    bids: OrderBookEntry[];
    asks: OrderBookEntry[];
  };
  openOrders: Order[];
  orderHistory: Order[];
  portfolio: Portfolio;
  transactions: Transaction[];
  onHoldBalances: OnHoldBalances;
  isConnected: boolean;
  chartTimeframe: "5m" | "15m" | "1h" | "4h" | "1d";
}

type TradingAction =
  | { type: "UPDATE_PRICE"; payload: PriceData }
  | {
      type: "UPDATE_ORDER_BOOK";
      payload: { bids: OrderBookEntry[]; asks: OrderBookEntry[] };
    }
  | { type: "PLACE_ORDER"; payload: Order }
  | { type: "CANCEL_ORDER"; payload: string }
  | { type: "FILL_ORDER"; payload: string }
  | { type: "UPDATE_PORTFOLIO"; payload: Portfolio }
  | { type: "ADD_TRANSACTION"; payload: Transaction }
  | { type: "UPDATE_ON_HOLD_BALANCES"; payload: OnHoldBalances }
  | { type: "SET_CONNECTION"; payload: boolean }
  | { type: "SET_TIMEFRAME"; payload: "5m" | "15m" | "1h" | "4h" | "1d" };

const initialState: TradingState = {
  currentPrice: {
    symbol: "BTC/USDT",
    price: 37268.0,
    change24h: 0.34,
    high24h: 37758.0,
    low24h: 36908.7,
    volume24h: 611983119.22,
    timestamp: Date.now(),
  },
  orderBook: {
    bids: [
      { price: 37275, amount: 0.142, total: 5.291 },
      { price: 37274, amount: 0.208, total: 7.753 },
      { price: 37273, amount: 0.175, total: 6.523 },
      { price: 37272, amount: 0.068, total: 2.535 },
      { price: 37271, amount: 0.392, total: 14.61 },
    ],
    asks: [
      { price: 37286, amount: 0.162, total: 6.041 },
      { price: 37285, amount: 0.238, total: 8.876 },
      { price: 37284, amount: 0.195, total: 7.27 },
      { price: 37283, amount: 0.088, total: 3.281 },
      { price: 37282, amount: 0.452, total: 16.851 },
    ],
  },
  openOrders: [],
  orderHistory: [],
  portfolio: {
    balances: {
      BTC: 0.5432,
      USDT: 15420.5,
      ETH: 2.1234,
      BNB: 45.67,
    },
    totalValue: 50000.0,
  },
  transactions: [],
  onHoldBalances: {
    USDT: 0,
    BTC: 0,
    ETH: 0,
    BNB: 0,
  },
  isConnected: false,
  chartTimeframe: "5m",
};

// Helper function to calculate on-hold amounts from pending limit orders
function calculateOnHoldBalances(orders: Order[]): OnHoldBalances {
  const onHold: OnHoldBalances = { USDT: 0, BTC: 0, ETH: 0, BNB: 0 };

  orders
    .filter((order) => order.status === "pending" && order.type === "limit")
    .forEach((order) => {
      if (order.side === "buy") {
        // For buy orders, USDT is on hold (price × quantity)
        onHold.USDT += order.amount * order.price;
      } else if (order.side === "sell") {
        // For sell orders, the crypto asset is on hold (quantity)
        if (order.symbol === "BTC/USDT") {
          onHold.BTC += order.amount;
        } else if (order.symbol === "ETH/USDT") {
          onHold.ETH += order.amount;
        } else if (order.symbol === "BNB/USDT") {
          onHold.BNB += order.amount;
        }
      }
    });

  return onHold;
}

function tradingReducer(
  state: TradingState,
  action: TradingAction
): TradingState {
  switch (action.type) {
    case "UPDATE_PRICE":
      return { ...state, currentPrice: action.payload };

    case "UPDATE_ORDER_BOOK":
      return { ...state, orderBook: action.payload };

    case "PLACE_ORDER":
      const newStateWithOrder = {
        ...state,
        openOrders: [...state.openOrders, action.payload],
      };
      // Recalculate on-hold balances after placing order
      return {
        ...newStateWithOrder,
        onHoldBalances: calculateOnHoldBalances(newStateWithOrder.openOrders),
      };

    case "CANCEL_ORDER":
      const newStateAfterCancel = {
        ...state,
        openOrders: state.openOrders.filter(
          (order) => order.id !== action.payload
        ),
        orderHistory: [
          ...state.orderHistory,
          ...state.openOrders
            .filter((order) => order.id === action.payload)
            .map(
              (order): Order => ({
                ...order,
                status: "cancelled" as "cancelled",
              })
            ),
        ],
      };
      // Recalculate on-hold balances after canceling order
      return {
        ...newStateAfterCancel,
        onHoldBalances: calculateOnHoldBalances(newStateAfterCancel.openOrders),
      };

    case "FILL_ORDER":
      const filledOrder = state.openOrders.find(
        (order) => order.id === action.payload
      );
      if (!filledOrder) return state;

      const newStateAfterFill = {
        ...state,
        openOrders: state.openOrders.filter(
          (order) => order.id !== action.payload
        ),
        orderHistory: [
          ...state.orderHistory,
          { ...filledOrder, status: "filled" as const },
        ],
      };
      // Recalculate on-hold balances after filling order
      return {
        ...newStateAfterFill,
        onHoldBalances: calculateOnHoldBalances(newStateAfterFill.openOrders),
      };

    case "UPDATE_PORTFOLIO":
      return { ...state, portfolio: action.payload };

    case "ADD_TRANSACTION":
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      };

    case "UPDATE_ON_HOLD_BALANCES":
      return { ...state, onHoldBalances: action.payload };

    case "SET_CONNECTION":
      return { ...state, isConnected: action.payload };

    case "SET_TIMEFRAME":
      return { ...state, chartTimeframe: action.payload };

    default:
      return state;
  }
}

interface TradingContextType {
  state: TradingState;
  placeOrder: (orderData: Omit<Order, "id" | "timestamp">) => void;
  cancelOrder: (orderId: string) => void;
  setTimeframe: (timeframe: "5m" | "15m" | "1h" | "4h" | "1d") => void;
  getAvailableBalance: (symbol: string) => number;
}

const TradingContext = createContext<TradingContextType | undefined>(undefined);

export function TradingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tradingReducer, initialState);

  // Real API connection for live updates
  useEffect(() => {
    dispatch({ type: "SET_CONNECTION", payload: true });

    // Function to fetch live crypto data (uses CoinGecko API key if available)
    const fetchCryptoData = async () => {
      try {
        const response = await fetch(
          "/api/crypto-data?symbol=BTC&orderBook=true"
        );
        if (response.ok) {
          const data = await response.json();

          // Update price data
          if (data.priceData) {
            dispatch({
              type: "UPDATE_PRICE",
              payload: data.priceData,
            });
          }

          // Update order book data
          if (data.orderBook) {
            dispatch({
              type: "UPDATE_ORDER_BOOK",
              payload: data.orderBook,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching crypto data:", error);
        dispatch({ type: "SET_CONNECTION", payload: false });
      }
    };

    // Initial fetch
    fetchCryptoData();

    // Set up polling for live updates (optimized for API rate limits)
    const priceInterval = setInterval(fetchCryptoData, 30000); // Update every 30 seconds

    // Simulate order fills (keeping this for demo purposes)
    const orderFillInterval = setInterval(() => {
      if (state.openOrders.length > 0) {
        const randomOrder =
          state.openOrders[Math.floor(Math.random() * state.openOrders.length)];
        if (Math.random() < 0.1) {
          // 10% chance to fill an order
          dispatch({ type: "FILL_ORDER", payload: randomOrder.id });

          // Add transaction
          const transaction: Transaction = {
            id: uuidv4(),
            symbol: randomOrder.symbol,
            side: randomOrder.side,
            amount: randomOrder.amount,
            price: randomOrder.price,
            fee: randomOrder.amount * randomOrder.price * 0.001, // 0.1% fee
            timestamp: Date.now(),
          };

          dispatch({ type: "ADD_TRANSACTION", payload: transaction });
        }
      }
    }, 5000);

    return () => {
      clearInterval(priceInterval);
      clearInterval(orderFillInterval);
      dispatch({ type: "SET_CONNECTION", payload: false });
    };
  }, [state.openOrders.length]);

  const placeOrder = (orderData: Omit<Order, "id" | "timestamp">) => {
    const order: Order = {
      ...orderData,
      id: uuidv4(),
      timestamp: Date.now(),
      status: "pending",
    };

    dispatch({ type: "PLACE_ORDER", payload: order });
  };

  const cancelOrder = (orderId: string) => {
    dispatch({ type: "CANCEL_ORDER", payload: orderId });
  };

  const setTimeframe = (timeframe: "5m" | "15m" | "1h" | "4h" | "1d") => {
    dispatch({ type: "SET_TIMEFRAME", payload: timeframe });
  };

  // Helper function to get available balance (total - on hold)
  const getAvailableBalance = (symbol: string): number => {
    const totalBalance = state.portfolio.balances[symbol] || 0;
    const onHoldAmount =
      state.onHoldBalances[symbol as keyof OnHoldBalances] || 0;
    return Math.max(0, totalBalance - onHoldAmount);
  };

  return (
    <TradingContext.Provider
      value={{
        state,
        placeOrder,
        cancelOrder,
        setTimeframe,
        getAvailableBalance,
      }}
    >
      {children}
    </TradingContext.Provider>
  );
}

export function useTrading() {
  const context = useContext(TradingContext);
  if (context === undefined) {
    throw new Error("useTrading must be used within a TradingProvider");
  }
  return context;
}
