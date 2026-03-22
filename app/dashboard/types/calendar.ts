import { Trade } from "@prisma/client";

export interface CalendarEntry {
  pnl: number;
  tradeNumber: number;
  longNumber: number;
  shortNumber: number;
  trades: Trade[];
  isProfit?: boolean;
  isLoss?: boolean;
  isBreakEven?: boolean;
  dailyRMultiple?: number;
}

export interface CalendarData {
  [date: string]: CalendarEntry;
}
