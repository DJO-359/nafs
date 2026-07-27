import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

import App from "./app/App";
import { Providers } from "./app/providers";
import { ensureAuth } from "./hooks/useAuth";

async function bootstrap() {
  await ensureAuth();

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <Providers>
        <App />
      </Providers>
    </StrictMode>,
  );
}

bootstrap();
