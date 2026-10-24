import * as handlers from "../../../functions/api/livekit/room/create.js";
import { runFetchHandler } from "../../_lib/bridge.js";

export default function handler(req, res) {
  return runFetchHandler(req, res, handlers, 12000);
}
