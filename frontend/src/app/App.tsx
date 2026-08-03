import { RouterProvider } from "react-router-dom";

import AuthGate from "./AuthGate";
import { router } from "./router";

export default function App() {
  return (
    <AuthGate>
      <RouterProvider router={router} />
    </AuthGate>
  );
}
