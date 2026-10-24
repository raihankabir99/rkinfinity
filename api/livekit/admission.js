export const config = { api: { bodyParser: false } };

import * as handlers from "../../functions/api/livekit/admission.js";
import { runFetchHandler } from "../_lib/bridge.js";

export default function handler(req, res) {
  return runFetchHandler(req, res, handlers, 12000);
}
