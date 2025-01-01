import {
    createBrowserRouter,
    RouterProvider,
  } from "react-router-dom";
import Root from "./routes/Root";
import ErrorElement from "./routes/Error";
import Home from "./routes/Home";
import store from "./store";
import { fetchContentNewsItems } from "./content/slice";
import { lazy, Suspense } from "react";
import MarkdownPageLayout from "./components/feature:markdown-content/MarkdownPageLayout";

export const lazyLoad = (
  component: React.ComponentType,
  Layout?: React.ComponentType<{ children: React.ReactNode }>
 ) => {
  const Component = component;
  return () => (  
    <Suspense fallback={<div>Loading...</div>}>
      {Layout ? (
        <Layout>{<Component />}</Layout>
      ) : (
        <Component />
      )}
    </Suspense>
  );
 };

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
        element: lazyLoad(lazy(()=>import('./routes/Novitas')))(),
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
        element: lazyLoad(lazy(()=>import('./routes/feature:family-tree-entry-and-visualisation/HomeSermo')))()
      },
      // Codex
      {
          path: "codex",
          element: lazyLoad(lazy(()=>import('./routes/feature:family-tree-entry-and-visualisation/HomeCodex')))()
      },
      {
        path: "codex/notation",
        element: lazyLoad(lazy(()=>import('./content/markdown/codex-notation.md')), MarkdownPageLayout)()
      },
      // Atrium Familiarum
      {
        path: "atrium",
        element: lazyLoad(lazy(()=>import('./routes/feature:family-tree-directory/HomeAtrium')))()
      },
      // About Us
      {
        path: "about/principia",
        element: lazyLoad(lazy(()=>import('./content/markdown/about/principia.md')), MarkdownPageLayout)()
      },
      {
        path: "about/auguria",
        element: lazyLoad(lazy(()=>import('./content/markdown/about/auguria.mdx')), MarkdownPageLayout)()
      },
      // Advertisement      
      {
        path: "advertise/slot/:slotNumber",
        element: lazyLoad(lazy(()=>import('./content/markdown/purchase-advertisement-slot.mdx')), MarkdownPageLayout)()
      },
      {
        path: "advertise/terms",
        element: lazyLoad(lazy(()=>import('./content/markdown/terms-and-conditions/advertisement.md')), MarkdownPageLayout)()
      },
      // Terms and Conditions
      // ...
      // Policies
      // ...
    ]
  },
]);

const Router = () => <RouterProvider router={router} />
export default Router;
