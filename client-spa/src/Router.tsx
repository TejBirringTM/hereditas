import {
    createBrowserRouter,
    RouterProvider,
  } from "react-router-dom";
import Root from "./routes/Root";
import Home from "./routes/FamilyTreeEntry/Home";
import UsersGuide from "./routes/FamilyTreeEntry/UsersGuide";
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

const Router = () => <RouterProvider router={router} />
export default Router;
