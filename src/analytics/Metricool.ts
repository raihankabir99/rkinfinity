let isInitialized = false;

export function initializeMetricool(): void {
  if (isInitialized) {
    return;
  }

  isInitialized = true;

  const loadScript = (callback: () => void) => {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://tracker.metricool.com/resources/be.js";
    script.onload = callback;
    script.onreadystatechange = () => {
      if (script.readyState === "loaded" || script.readyState === "complete") {
        callback();
      }
    };
    document.head.appendChild(script);
  };

  loadScript(() => {
    if (typeof (window as any).beTracker === "object") {
      (window as any).beTracker.t({
        hash: "72d77fa0b8974e1b6669b12d7e4b62b9",
      });
    }
  });
}
