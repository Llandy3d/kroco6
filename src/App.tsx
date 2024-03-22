import { Toaster } from "@/components/base/toaster";
import "./globals.css";

import { Main } from "@/views/Main";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

const client = new QueryClient();

function App() {
  return (
    <StrictMode>
      <QueryClientProvider client={client}>
        <Toaster />
        <Main />
      </QueryClientProvider>
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
