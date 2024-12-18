import {
    createBrowserRouter,
    RouterProvider,
  } from "react-router-dom";
import Root from "./routes/Root";
import Home from "./routes/feature:family-tree-entry-and-visualisation/Home";
import Error from "./routes/Error";
import MarkdownContent from "./routes/feature:markdown-content/MarkdownContent";

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
          element: <MarkdownContent content={import("./content/markdown/users-guide.md?raw")} />
      },
      {
        path: "about/what-is-tapestry•family",
        element: <MarkdownContent content={import("./content/markdown/about/what-is-tapestry•family.md?raw")} />
      },
      {
        path: "about/our-mission",
        element: <MarkdownContent content={import("./content/markdown/about/our-mission.md?raw")} />
      },
      {
        path: "about/our-story",
        element: <MarkdownContent content={import("./content/markdown/about/our-story.md?raw")} />
      },
      {
        path: "about/product-roadmap",
        element: <MarkdownContent content={import("./content/markdown/about/product-roadmap.md?raw")} />
      },
      {
        
      }
      // {
      //   path: "not-users-guide",
      //   element: <MarkdownContent content={import("./content/markdown/not-users-guide.md?raw")} />
      // }
    ]
  },
]);

const Router = () => <RouterProvider router={router} />
export default Router;
