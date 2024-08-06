import NextAuth from "next-auth";
import { env } from "process";

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    {
      id: "asana",
      name: "Asana",
      type: "oauth",
      scope: "default",
      token: "https://app.asana.com/-/oauth_token",
      authorization: "https://app.asana.com/-/oauth_authorize?scope=default",
      userinfo: "https://app.asana.com/api/1.0/users/me",
      async profile(profile, tokens) {
        return {
          id: profile.data.gid,
          gid: profile.data.gid,
          name: profile?.data?.name,
          image: profile?.data?.photo?.image_128x128,
        };
      },
      clientId: process.env.NEXT_CLIENT_ID,
      clientSecret: process.env.NEXT_CLIENT_SECRET,
    },
  ],

  pages: {
    signIn: "/",
  },

  callbacks: {
    /**
     * @param  {object}  token     Decrypted JSON Web Token
     * @param  {object}  user      User object      (only available on sign in)
     * @param  {object}  account   Provider account (only available on sign in)
     * @param  {object}  profile   Provider profile (only available on sign in)
     * @param  {boolean} isNewUser True if new user (only available on sign in)
     * @return {object}            JSON Web Token that will be saved
     */

    async jwt({ token, user, account, profile, isNewUser }) {
      // Add access_token to the token right after sign in
      // Don't overwrite values to null or undefined when this is called on decoding an encrypted JWT
      // Initial sign in

      console.log("user", user);
      console.log("account", account);
      console.log("profile", profile);

      if (account && profile) {
        return {
          ...token,
          access_token: account.access_token,
          accessTokenExpires: Date.now() + account.expires_in,
          refresh_token: account.refresh_token,
          picture: profile?.data?.photo?.image_128x128,
          gid: profile.data.gid,
        };
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < token.access_token_expires) {
        return token;
      }
      // Access token has expired, try to update it
      return await refreshAccessToken(token);
    },

    /**
     * @param  {object} session      Session object
     * @param  {object} token        User object    (if using database sessions)
     *                               JSON Web Token (if not using database sessions)
     * @return {object}              Session that will be returned to the client
     */

    async session({ session, token }) {
      console.log("log for session");
      // Add access_token to session
      session.access_token = token.access_token;
      session.user.name = token.name;
      session.user.gid = token.gid;
      session.user.image = token.picture;
      session.error = token.error;
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin == baseUrl) return url;
      return baseUrl;
    },
  },
  useSecureCookies: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60,

    // A secret to use for key generation - you should set this explicitly
    // Defaults to NextAuth.js secret if not explicitly specified.
    // This is used to generate the actual signingKey and produces a warning
    // message if not defined explicitly.
  },
};

export default NextAuth(authOptions);

/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 */
async function refreshAccessToken(token) {
  try {
    const url =
      "https://app.asana.com/-/oauth_token?" +
      new URLSearchParams({
        grant_type: "refresh_token",
        client_id: process.env.NEXT_CLIENT_ID,
        client_secret: process.env.NEXT_CLIENT_SECRET,
        redirect_uri: process.env.NEXTAUTH_URL + "api/auth/asana",
        code: token.refresh_token,
        refresh_token: token.refresh_token,
      });

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });
    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      access_token: refreshedTokens.access_token,
      access_token_expires: Date.now() + refreshedTokens.expires_in,
      refresh_token: refreshedTokens.refresh_token ?? token.refresh_token, // Fall back to old refresh token
    };
  } catch (error) {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}
