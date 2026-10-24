export const config = { api: { bodyParser: false } };

import * as handlers from "../functions/api/chat.js";
import { runFetchHandler } from "./_lib/bridge.js";

export default function handler(req, res) {
  return runFetchHandler(req, res, handlers, 262144);
}
