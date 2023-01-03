import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import Header from "../../src/components/Header";
import { Skeleton } from "@mui/material";
function App({}) {
  const router = useRouter();
  const { all } = router.query;
  const [newApp, setNewApp] = useState(false);
  let DynamicApp = false;
  if (all && all.length > 0 && all[0]) {
    DynamicApp = dynamic(() => import(`../../common/${all[0]}/index`), {
      suspense: true,
    });
  }
  return (
    <div className="w-full h-screen overflow-none">
      <Head>
        <title>AsanaToolbox</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <div className="grid grid-cols-12 w-full h-screen pt-12 -mt-12 overflow-none">
        <div className="col-start-2 col-end-12 h-full overflow-none">
          <Suspense
            fallback={<Skeleton className="w-full h-full overflow-none" />}
          >
            {DynamicApp ? <DynamicApp path={router.query} /> : "loading"}
          </Suspense>
        </div>
      </div>
    </div>
  );
}

App.auth = true;

export default App;
