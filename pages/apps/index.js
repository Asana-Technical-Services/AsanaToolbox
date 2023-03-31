import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import defaultAppImage from "../../public/img/toolbox-default.png";

const DynamicHeader = dynamic(() => import("../../src/components/Header"), {
  ssr: false,
});

function Apps({}) {
  const [pages, setPages] = useState({});
  const router = useRouter();
  const { all } = router.query;
  const [App, setApp] = useState(false);
  useEffect(() => {
    const directory = require.context(
      "../../common",
      true,
      /\.\/[\w]*?\/index\.js*?/
    );
    let keys = directory.keys();
    let newPages = {};
    for (let i = 0; i < keys.length; i++) {
      let pathArray = keys[i].split("/");
      let appName = pathArray[1].replace(/[A-Z]/g, " $&").trim();
      let path = `./apps/${pathArray[1]}`;
      if (appName && path) {
        newPages[appName] = { name: appName, path };
      }
    }
    setPages(newPages);
  }, []);

  return (
    <div className="h-screen min-w-full ">
      <DynamicHeader />
      <div className="absolute left-0 top-10 w-full h-auto z-20">
        <div className="block p-20 px-40 m-auto z-10 max-w-5xl">
          <h2 className="text-xl salmon">All Apps:</h2>
          <hr className=" border-black"></hr>
          <div className=" grid grid-cols-4 grid-flow-row my-2 gap-2 place-content-center">
            {Object.entries(pages).map(([key, page]) => {
              return (
                <div key={page.name}>
                  <Link href={page.path}>
                    <button className="flex flex-col items-center w-full">
                      <div className="block w-20 h-20 rounded-lg">
                        <Image src={page.image || defaultAppImage} />
                      </div>
                      <div className="">{page.name}</div>
                    </button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div
        className=" bg-[url('/img/dotgrid.png')] bg-cover 
 opacity-20 left-0 top-0 absolute w-full h-full z-0"
      ></div>
    </div>
  );
}

Apps.auth = true;

export default Apps;
