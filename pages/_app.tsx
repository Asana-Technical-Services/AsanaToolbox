import "../styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider, useSession, signIn } from "next-auth/react";
import React from "react";

export default function MyApp({
  Component,
  pageProps,
}: AppProps & { Component: { auth: boolean } }) {
  return (
    <SessionProvider session={pageProps.session}>
      {Component.auth ? (
        <Auth>
          <Component {...pageProps} />
        </Auth>
      ) : (
        <Component {...pageProps} />
      )}
    </SessionProvider>
  );
}

function Auth({ children }: any): any {
  const { data: session, status } = useSession();
  const isUser = !!session?.user;

  React.useEffect(() => {
    // Do nothing while loading
    if (status == "loading") return;
    // If not authenticated or if we could not refresh thier access, force log in
    if (!isUser || session?.error === "RefreshAccessTokenError" || !session)
      signIn();
  }, [isUser, status]);

  if (isUser) {
    return children;
  }

  // Session is being fetched, or no user.
  // If no user, useEffect() will redirect.
  return <div>Loading...</div>;
}
