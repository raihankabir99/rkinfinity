import { initializeClarity } from "./Clarity";
import { initializeGoogleAnalytics } from "./GoogleAnalytics";
import { initializeMetaPixel } from "./MetaPixel";
import { initializeMetricool } from "./Metricool";
import { initializeTikTokPixel } from "./TikTokPixel";

export function initializeAnalytics(): void {
  initializeMetricool();
  initializeMetaPixel();
  initializeGoogleAnalytics();
  initializeTikTokPixel();
  initializeClarity();
}
