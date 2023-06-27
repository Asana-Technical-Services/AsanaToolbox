import Cors from 'cors';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../pages/api/auth/[...nextauth]';
import { handleFormData } from './controllers';

/* Initializing the cors middleware
You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
*/
const cors = Cors({
  methods: ['POST', 'GET'],
});
/* Helper method to wait for a middleware to execute before continuing
and to throw an error when an error happens in a middleware
*/
async function applyCors(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

async function handler(req, res) {
  let session;
  try {
    session = await getServerSession(req, res, authOptions);
    console.log('session: ', session);
  } catch (error) {
    console.log('error: ', error);
  }

  await applyCors(req, res, cors);
  const route = req?.query?.all;
  const reqData = req?.body;

  if (route.length <= 1) {
    res.status(404).send();
  }
  if (!reqData) {
    res.status(400).json({
      error: 'Invalid request data sent',
      data: reqData,
    });
  }
  if (!session?.user?.gid) {
    res.status(400).json({
      error: 'Invalid user session data',
      data: session,
    });
  }

  if (route[1] === 'build') {
    console.log(
      `Triggering 'build' route endpoint with reqData: ${JSON.stringify(
        reqData
      )}`
    );
    const response = await handleFormData(req, res);
    if (response) {
      res.status(200).json(response);
    }
  }
  res.status(200).json({});
}

export default handler;
