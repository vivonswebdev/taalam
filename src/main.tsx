import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Register custom SW for offline + push notifications
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

createRoot(document.getElementById("root")!).render(<App />);
