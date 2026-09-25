import { Capacitor } from "@capacitor/core";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { configureStatusBar } from "./lib/statusBar";
import { installNativeGeolocation } from "./lib/nativeGeolocation";

// Configure native status bar (no-op on web)
configureStatusBar();
// Native location prompt instead of the WebView's « localhost » one (no-op on web)
installNativeGeolocation();

// PWA service worker: web only (the native app ships its assets and updates via the stores)
if (!Capacitor.isNativePlatform()) import("./registerSW");

createRoot(document.getElementById("root")!).render(<App />);
