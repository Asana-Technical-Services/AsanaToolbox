import { signIn, signOut, useSession } from "next-auth/react";

import { useState, useEffect } from "react";
//import ReactCSSTransitionGroup from "react-transition-group"; // ES6

export default function SplashPage() {
  const { data: session } = useSession();
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const { innerWidth: width, innerHeight: height } = window;
  const [checkMouse, setCheckMouse] = useState(true);

  const cursorHandler = (e: MouseEvent) => {
    if (e.pageX && e.pageY && checkMouse) {
      setCheckMouse(false);
      setCursorPos({ x: e.pageX, y: e.pageY });
      setTimeout(() => {
        setCheckMouse(true);
      }, 100);
    }
  };

  useEffect(() => {
    document.addEventListener("mousemove", cursorHandler);
    return () => {
      document.removeEventListener("mousemove", cursorHandler);
    };
  }, []);

  const x = (-1 * (cursorPos.x - width / 2)) / 40;
  const y = (-1 * (cursorPos.y - height / 2)) / 40;

  return (
    <div className="absolute overflow-hidden h-screen w-screen">
      <div
        style={{
          transform: `translate(${String(x)}px,${String(y)}px`,
        }}
        className="absolute overflow-hidden opacity-20 h-screen min-w-full bg-[length:_100%] bg-[url('/img/dotgrid.png')]"
      ></div>

      <div
        style={{
          transform: `translate(${String((-1 / 2) * x)}px,${String(
            (-1 / 2) * y
          )}px`,
        }}
        className="absolute  -mt-[20%] -ml-[30%] min-h-full min-w-full w-[100%] h-[200%]  bg-[length:_100%] bg-no-repeat bg-[url('/img/bigthreedots.png')]"
      ></div>
      <div className="absolute  right-20 top-20 salmon text-right">
        <h1>Asana Toolbox</h1>
        <p>{"A collection of tools and demonstrations using Asana’s API"}</p>
        <br></br>
        <p>
          to get started,
          <button
            onClick={() =>
              signIn("asana", { callbackUrl: "http://localhost:3000/apps" })
            }
            className="p-2 rounded-full bg-gray-50 border-2"
          >
            sign in with Asana
          </button>
        </p>
      </div>
    </div>
  );
}
