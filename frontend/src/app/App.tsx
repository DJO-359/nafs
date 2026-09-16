import { RouterProvider } from "react-router-dom";

import AuthGate from "./AuthGate";
import { router } from "./router";

function AuthorizedApp() {
  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <AuthGate>
      <AuthorizedApp />
    </AuthGate>
  );
}
