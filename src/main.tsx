import { createRoot } from "react-dom/client";
import { TranslationProvider } from "./contexts/TranslationContext";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <TranslationProvider>
    <App />
  </TranslationProvider>
);
