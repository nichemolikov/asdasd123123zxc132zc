import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./utils/diagnoseApp";

// Error boundary for app initialization
window.addEventListener("error", (event) => {
  console.error("🚨 Global Error:", event.error);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("🚨 Unhandled Promise Rejection:", event.reason);
});

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found! Check index.html for <div id='root'></div>");
}

createRoot(rootElement).render(<App />);
