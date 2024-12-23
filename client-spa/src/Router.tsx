import {
    createBrowserRouter,
    RouterProvider,
  } from "react-router-dom";
import Root from "./routes/Root";
import HomeSermo from "./routes/feature:family-tree-entry-and-visualisation/HomeSermo";
import HomeCodex from "./routes/feature:family-tree-entry-and-visualisation/HomeCodex";
import ErrorElement from "./routes/Error";
import MarkdownContent from "./components/feature:markdown-content/MarkdownContent";
import Home from "./routes/Home";
import HomeAtrium from "./routes/feature:family-tree-directory/HomeAtrium";
import Novitas from "./routes/Novitas";
import store from "./store";
import { fetchContentNewsItems } from "./content/slice";
import { Box } from "@mantine/core";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorElement />,
    children: [
      {
        path: "",
        element: <Home />
      },
      // Novitates -> Novitas
      {
        path: "novitas/:recordId",
        element: <Novitas />,
        async loader({params}) {
          await store.dispatch(fetchContentNewsItems());
          const state = store.getState();
          const recordId = params.recordId;
          const record = state.content.newsItems?.find((r)=>r.id === recordId);    
          if (record) {
            return {
              record
            }
          } else {
            throw new Error(`Novitas not found: ${recordId}`);
          }
        }
      },
      // Sermo
      {
        path: "sermo",
        element: <HomeSermo />
      },
      // Codex
      {
          path: "codex",
          element: <HomeCodex />
      },
      {
        path: "codex/notation",
        element: (
          <Box px={{base: 0, sm:"1rem"}}>
            <MarkdownContent content={import("./content/markdown/codex-notation.md?raw")} />
          </Box>
        )
      },
      // Atrium Familiarum
      {
        path: "atrium",
        element: <HomeAtrium />
      },
      // About Us
      {
        path: "about/principia",
        element: (
            <Box px={{base: 0, sm:"1rem"}}>
              <MarkdownContent content={import("./content/markdown/about/principia.md?raw")} />
            </Box>
          )
      },
      {
        path: "about/auguria",
        element: (
            <Box px={{base: 0, sm:"1rem"}}>
              <MarkdownContent content={import("./content/markdown/about/auguria.md?raw")} />
            </Box>
          )
      },
      // Terms and Conditions
      {
        path: "terms/advertisement",
        element: (
            <Box px={{base: 0, sm:"1rem"}}>
              <MarkdownContent content={import("./content/markdown/terms-and-conditions/advertisement.md?raw")} />
            </Box>
          )
      }
      // Policies
      // ...
    ]
  },
]);

const Router = () => <RouterProvider router={router} />
export default Router;
