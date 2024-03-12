import "./globals.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Page } from "./routes/Page";

function App() {
  return (
    <StrictMode>
      <Page />
    </StrictMode>
  );
}

const container = document.getElementById("app");

if (container === null) {
  throw new Error("Could not find app container element.");
}

const root = createRoot(container);

root.render(<App />);

window.addEventListener("unhandledrejection", (event) => {
  console.error(event.reason);
});
