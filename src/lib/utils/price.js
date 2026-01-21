import mongoose from "mongoose";

export const toDecimal = (value) =>
  mongoose.Types.Decimal128.fromString(Number(value).toFixed(2));

export const fromDecimal = (value) =>
  value ? parseFloat(value.toString()) : 0;
