import {
    createBrowserRouter,
    RouterProvider,
  } from "react-router-dom";
import Root from "./routes/root";
import Home from "./routes/Home";
import UsersGuide from "./routes/UsersGuide";
import Error from "./routes/Error";

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Root />,
      errorElement: <Error />,
      children: [
        {
            path: "",
            element: <Home />
        },
        {
            path: "users-guide",
            element: <UsersGuide />
        }
      ]
    },
  ]);

  export default () => <RouterProvider router={router} />
