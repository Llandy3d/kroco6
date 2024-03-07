import "./globals.css";

import { createRoot } from "react-dom/client";
import { Page } from "./routes/Page";

function App() {
  return <Page />;
}

const container = document.getElementById("app");

if (container === null) {
  throw new Error("Could not find app container element.");
}

const root = createRoot(container);

root.render(<App />);
