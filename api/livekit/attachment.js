import * as handlers from "../../functions/api/livekit/attachment.js";
import { runFetchHandler } from "../_lib/bridge.js";

export default function handler(req, res) {
  return runFetchHandler(req, res, handlers, 16777216);
}
