# Asana Toolbox

Asana Toolbox is a common platform for simple apps that use Asana's API. It's meant as a quick way to get started developing with Asana's API, and

# Task History tool

This is a tool that can be used to view

## Initial Setup

### OAuth2 and Asana

This app uses OAuth2 for authoriaztion, meaning that users authorize the app to view Asana as them to get task history data.

The overall OAuth flow goes something like this:

- User clicks "sign in" on our app
- User is redirected to Asana, where they authorize the app to use Asana as them.
- User gets redirected back to our app with a code that lets our app use Asana as them for a period of time

This is explained further in the Asana developer docs [here](https://developers.asana.com/docs/oauth). Go through the steps that those docs provide for registering an app.

Take note of the Client ID and Client Secret. We also need to provide a redirect URL. For local development and getting started, enter in `http://localhost:3000/api/auth/callback/asana`

### Environment Variables

To allow the code here to act as the app you just created, create a `.env.local` file in the root directory, and provide the following:

```
NEXT_AUTH_URL=base url for auth redirect, for development this should be [http://localhost:3000]
NEXT_CLIENT_SECRET=client secret from the app you created above
NEXT_CLIENT_ID=client id from the app you created above
NEXT_ENCRYPTION_KEY=long random string for encrypting the cookie that gets saved to the browser
```

The last variable is an encryption key for the data we store between sessions in order to keep users logged in. To do this, the app saves a cookie in the browser with the access token and a few other details. So that we don't leak information, this info is encrypted with a key that should be kept secret, and only entered in the env variables.

### Install and Run

run the command `npm install` to install dependencies

run the command `npm run dev` to run the app locally in development mode.

you can then interact with app in the browser at [http://localhost:3000](http://localhost:3000) to view it in the browser.\
The page will reload if you make edits.\
You will also see any errors in the console.

## Project Structure

This project is built using a few libraries for some of the core functionality. You may need to reference their documentation to understand some of the code here. Those libraries are:

- [Next.js](https://nextjs.org/docs) for overall page structure
- [React](https://reactjs.org/) for reactive javascript app pages
- [Next-Auth](https://next-auth.js.org/) for OAuth2
- [Styled-Components](https://styled-components.com/docs/) for component styling
- [typescript](https://www.typescriptlang.org/) for typed javascript

It is also built to be deployed on [AWS Amplify](https://aws.amazon.com/amplify/). The complexities of that will be discussed later, but there's a YAML file

### File structure

```
-+pages
 |- api / [...nextauth].js - Next-Auth endpoint handling redirects in the OAuth flow
 |- task / [...taskId].js - Page for viewing specific tasks
 |- _app.tsx - This adds a wrapper to the standard Next App so we can access the Next-Auth objects from anywhere
 |- _document.js - This adds a minor modification to the standard Next document so that styled components work for static server-rendered pages.
 |-home.tsx - the base home page for signed-in users, which provides the tasks form
 |-index.tsx - the main splash page for users not signed in, which provides info about the app
 |-signin.tsx - the sign in page to initiate the OAuth flow
-+ public - Folder containing public images and the index.html file that contains the main entrypoint for the app
-+ src - source code for the app compontents and logic
 |-+components/* - React app components
 |-+utils/* - logic for making API calls and computing Asana Task History
-+ styles/globals.css - global CSS for the app
-.babelrc - babel config for pre-compiling styled components
-.gitignore
-.amplify.yml - configures the build settings for AWS so you can pull env variables into Next
-custom.d.ts - typescript settings
-next-env.d.ts - Next+typescript settings
-next-config.js - Next+react setting
-package.json - dependencies listing
-README.md
-tsconfig.json - more typescript settings 😊
```

## Deploying

To deploy this app on AWS Amplify, first:
1 - Fork this repository, and make sure you follow the overview getting started above and have tested it locally.
2 - Commit this to a new repository on Github. Do not commit your .env.local file
5 - Log in to AWS Amplify console. Create a new app, and add a frontend from Github following the latter half of [this flow](https://docs.amplify.aws/guides/hosting/nextjs/q/platform/js/#deploy-and-host-a-hybrid-app-ssg-and-ssr). You shouldn't need the Amplify CLI.
4 - Add the environment variables in just as you have them above in the .env.local. These are not, and should not, be used in any frontend code, and so are echoed to the next app when building the backend. That echo is done in the .amplify.yml file above, along with other build settings. The `NEXT_AUTH_URL` environment variable should be the same as the Production branch URL under App Settings > General > App Details in the AWS console.
