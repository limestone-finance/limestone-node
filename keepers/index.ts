import mock from "./mock-keeper";
import basic from "./basic-keeper";
import { Keeper } from "../types";

export default {
  basic,
  mock,
} as { [name: string]: Keeper };
