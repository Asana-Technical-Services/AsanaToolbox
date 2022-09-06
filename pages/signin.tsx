import { useEffect } from "react";
import { useRouter } from "next/router";
import styled from "styled-components";

import { getProviders, useSession, signIn } from "next-auth/react";

export default function SignIn({}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      router.replace("/home");
    }
  }, [session]);

  return (
    <div className="container asana-gradient">
      <div className="signin-box">
        <span className="emoji-logo">🧰</span>
        <h2>Asana Toolbox</h2>
        <div>
          <button
            className="blue rounded"
            onClick={() =>
              signIn("asana", { callbackUrl: "http://localhost:3000/home" })
            }
          >
            Connect with Asana
          </button>
        </div>
        <p>this will redirect you to Asana to verify the app</p>
      </div>
    </div>
  );
}
