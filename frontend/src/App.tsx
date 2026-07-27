// import { useEffect, useState } from "react";
// import { RouterProvider } from "react-router-dom";
// import { router } from "./router";
// import { ensureAuth } from "../hooks/useAuth";

// export default function App() {
//   const [ready, setReady] = useState(false);

//   useEffect(() => {
//     async function init() {
//       try {
//         // Проверяем/получаем токен
//         await ensureAuth();
//       } finally {
//         setReady(true);
//       }
//     }

//     init();
//   }, []);

//   if (!ready) {
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         Загрузка...
//       </div>
//     );
//   }

//   return <RouterProvider router={router} />;
// }
