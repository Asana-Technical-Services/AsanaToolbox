import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Skeleton } from "@mui/material";
import axios from "axios";

export default function SplashPage() {
  const { data: session } = useSession();

  // this is a variable of convenience. you can make api calls whenever this is true
  const [ready, setReady] = useState(false);

  // many requests require you to specify a workspace, so we've provided that here
  const [workspaces, setAvailableWorkspaces] = useState([]);

  useEffect(() => {
    if (session && session.access_token) {
      // do any inialization here - as soon as we have an access token read from the JWT in cookies.
      // sometimes the session isn't set on first render, especially if users are navigating directly to your app

      // for convenience, also adding "ready" as a stateful variable.
      setReady(true);
      console.log("work");
      console.log(workspaces);

      //if we haven't already, get our available workspaces
      if (workspaces?.length == 0) {
        console.log("running axios");
        axios
          .get("https://app.asana.com/api/1.0/workspaces", {
            headers: { Authorization: `Bearer ${session.access_token}` },
          })
          .then((response) => {
            console.log("response");
            console.log(response.data);
            if (response?.data?.data) {
              setAvailableWorkspaces(response.data.data);
            }
          });
      }
    }
  }, [session]);

  // we have Tailwind CSS https://tailwindcss.com/docs/installation
  //  and Material UI components https://mui.com/material-ui/
  // available to import and use

  return (
    <div className="px-4 py-2 m-auto my-20 max-w-2xl flex flex-col content-center">
      <div>hi!</div>
      <div>this is a sample app which can be developed upon</div>
      <div> for example, here are your user's current workspaces:</div>
      <div>
        {workspaces.length > 0 ? (
          <ul>
            {workspaces.map((space) => {
              return <li>{space.name}</li>;
            })}
          </ul>
        ) : (
          <div>
            <Skeleton animation="wave" width={200} />
            <Skeleton animation="wave" width={200} />
            <Skeleton animation="wave" width={200} />
          </div>
        )}
      </div>
    </div>
  );
}
