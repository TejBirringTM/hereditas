import {
    createBrowserRouter,
    RouterProvider,
  } from "react-router-dom";
import Root from "./routes/Root";
import ErrorElement from "./routes/Error";
import Home from "./routes/Home";
import store from "./store";
import { fetchContentNewsItems } from "./content/slice";
import { JSXElementConstructor, lazy, Suspense } from "react";
import MarkdownPageLayout from "./components/feature:markdown-content/MarkdownPageLayout";
import { renderComponentMap } from "./components/feature:markdown-content/render-component-mapping";

export const lazyLoad = <
  T extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>
>(
  component: React.ComponentType,
  componentProps?: React.ComponentProps<T>,
  layout?: React.ComponentType<{ children: React.ReactNode }>
 ) => {
  const Component = component;
  const Layout = layout;

  return () => (  
    <Suspense fallback={<div>Loading...</div>}>
      {Layout ? (
        <Layout>{<Component />}</Layout>
      ) : (
        <Component {...componentProps} />
      )}
    </Suspense>
  );
 };

 const lazyLoadMdx = (
  component: React.ComponentType<any>,
 ) => {
  const Component = component;
  return () => (  
    <Suspense fallback={<div>Loading...</div>}>
      <MarkdownPageLayout>
        <Component components={renderComponentMap} />
      </MarkdownPageLayout>
    </Suspense>
  ); 
 }

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
        element: lazyLoadMdx(lazy(()=>import('./content/markdown/codex-notation.md')))()
      },
      // Atrium Familiarum
      {
        path: "atrium",
        element: lazyLoad(lazy(()=>import('./routes/feature:family-tree-directory/HomeAtrium')))()
      },
      // About Us
      {
        path: "about/principia",
        element: lazyLoadMdx(lazy(()=>import('./content/markdown/about/principia.md')))()
      },
      {
        path: "about/auguria",
        element: lazyLoadMdx(lazy(()=>import('./content/markdown/about/auguria.mdx')))()
      },
      // Advertisement      
      {
        path: "advertise/slot/:slotNumber",
        element: lazyLoadMdx(lazy(()=>import('./content/markdown/purchase-advertisement-slot.mdx')))()
      },
      {
        path: "advertise/terms",
        element: lazyLoadMdx(lazy(()=>import('./content/markdown/terms-and-conditions/advertisement.md')))()
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
