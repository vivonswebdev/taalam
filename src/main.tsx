import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./registerSW";
import { configureStatusBar } from "./lib/statusBar";

// Configure native status bar (no-op on web)
configureStatusBar();

createRoot(document.getElementById("root")!).render(<App />);
