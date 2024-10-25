import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../pages/api/auth/[...nextauth]';
import axios from 'axios';

const targetUrl = "https://se6cjyl96d.execute-api.us-east-1.amazonaws.com/Dev/webhook";

async function handler(req, res) {
  const AWS_KEY = process.env["AWS_KEY"]
  console.log("here!")
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed.' });
  }

  let session;
  try {
    session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  } catch (error) {
    console.log('Error getting session: ', error);
    return res.status(500).json({ message: 'Server error' });
  }

  const token = session.access_token;
  console.log("got token!")

  try {
    await axios.get('https://app.asana.com/api/1.0/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log("user response")

    const { email, sourceLanguage, targetLanguage, workspace, serviceAccount } = req.body;

    const payload = {
      sourceLanguage,
      targetLanguage,
      email,
      workspace,
      serviceAccount,
      accessToken:token
    };
    console.log(payload)

    try {
      const response = await axios.post(targetUrl, payload, {
        headers: {"x-api-key": AWS_KEY},
        validateStatus: function (status) {
          // Consider all status codes as valid to prevent axios from throwing
          return true;
        }
      });

      console.log('Lambda response:', response.data);
      
      // Forward the exact status and response from Lambda
      return res.status(response.status).json(response.data);
      
    } catch (lambdaError) {
      console.log('Lambda error:', lambdaError.response?.data);
      // Forward Lambda's error response if available
      if (lambdaError.response) {
        return res.status(lambdaError.response.status).json(lambdaError.response.data);
      }
      throw lambdaError; // Let the outer catch handle other errors
    }
  } catch (error) {
    console.log('Error: ', error);
    // If we have a response with an error message, use that
    if (error.response?.data?.message) {
      return res.status(error.response.status || 500).json(error.response.data);
    }
    // Default error
    return res.status(500).json({ message: 'Server error' });
  }
}

export default handler;