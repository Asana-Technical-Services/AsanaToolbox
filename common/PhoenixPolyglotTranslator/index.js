import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Skeleton, Button, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import axios from 'axios';
import ServiceAccountInstructions from './components/ServiceAccountInstructions';


export default function SplashPage() {
  const { data: session } = useSession();

  const [sourceLanguage, setSourceLanguage] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');
  const [selectedWorkspace, setSelectedWorkspace] = useState('');
  const [ready, setReady] = useState(false);
  const [workspaces, setAvailableWorkspaces] = useState([]);
  const [responseMessage, setResponseMessage] = useState(null);
  const [serviceAccount, setServiceAccount] = useState('');
  const [email, setEmail] = useState('');



  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session && session.access_token) {
      setReady(true);

      if (workspaces.length === 0) {
        axios
          .get('https://app.asana.com/api/1.0/workspaces', {
            headers: { Authorization: `Bearer ${session.access_token}` },
          })
          .then((response) => {
            if (response?.data?.data) {
              setAvailableWorkspaces(response.data.data);
              if (response.data.data.length > 0) {
                setSelectedWorkspace(response.data.data[0].gid);
              }
            }
          });
      }
    }
  }, [session]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setReady(false);
    setIsLoading(true);

    try {
      const response = await axios.post('/api/apps/PhoenixPolyglotTranslator', {
        sourceLanguage,
        targetLanguage,
        workspace: selectedWorkspace,
        serviceAccount,
        email,
      });

      console.log('Response from server:', response.data);
      setResponseMessage(response.data.message || 'Your request has been submitted successfully! Translation is currently in progress. For smaller workspaces, this process may take up to 45 minutes, while larger workspaces may require up to 2 hours to complete.');

      // Clear form fields after successful submission
      setSourceLanguage('');
      setTargetLanguage('');
      setServiceAccount('');
      setEmail('');
    
       // Set timeout for success message
       setTimeout(() => {
        setResponseMessage(null);
      }, 30000);
    
    } catch (error) {
      console.error('Error submitting form:', error);
      let errorMessage;
      
      // Check for error response in different formats
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage = 'An error occurred while processing your request';
      }
      
      setResponseMessage(errorMessage);
      
      // Set timeout for error message
      setTimeout(() => {
        setResponseMessage(null);
      }, 30000);
    } finally {
      setReady(true);
      setIsLoading(false);
    }
};

  return (

    <div className="px-4 py-2 m-auto my-20 max-w-2xl flex flex-col content-center">
      <div className="text-4xl w-auto">Phoenix Polyglot Translator</div>
      <br />
      <div>
        Enter the source language, which is the current language of your environment, and the target language you wish to translate the environment into. Additionally, provide the service account token linked to your environment, ensuring it has full permissions.
      </div>

      <div className="mt-4 mb-4">
        <p>
          Please enter the 2-3 letter code for the languages you would like to use. For example, use "en" for English, "es" for Spanish, "fr" for French, etc. You can find the complete list of available language codes in the link below.
        </p>
      </div>

      <div className="mt-2 mb-4">
        <a 
          href="https://www.modernmt.com/api#languages" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700 underline"
        >
          View available language codes
        </a>
      </div>

      <ServiceAccountInstructions selectedWorkspace={selectedWorkspace} />
      <br />
      <div className="mt-2 mb-4">If you have any questions please reach out to Brian Nguyen!</div>

      <form onSubmit={handleFormSubmit} className="mt-4">
        <TextField
          label="Source Language Code"
          value={sourceLanguage}
          onChange={(e) => setSourceLanguage(e.target.value)}
          required
          fullWidth
          margin="normal"
          placeholder="e.g., en"
          helperText="Enter the 2-3 letter code for the source language"
        />
        <TextField
          label="Target Language Code"
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
          required
          fullWidth
          margin="normal"
          placeholder="e.g., es"
          helperText="Enter the 2-3 letter code for the target language"
        />
        <TextField
          label="Service Account"
          value={serviceAccount}
          onChange={(e) => setServiceAccount(e.target.value)}
          required
          fullWidth
          margin="normal"
          helperText="Enter the service account token with full permissions"
        />
        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
          margin="normal"
          placeholder="e.g., user@asana.com"
          helperText="Enter your Asana email and join #phx-polyglot-notifications to receive notifications!"
          type="email"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel id="workspace-select-label">Workspace</InputLabel>
          <Select
            labelId="workspace-select-label"
            value={selectedWorkspace}
            onChange={(e) => setSelectedWorkspace(e.target.value)}
            required
          >
            {workspaces.map((workspace) => (
              <MenuItem value={workspace.gid} key={workspace.gid}>
                {workspace.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button type="submit" disabled={!ready || isLoading} fullWidth>
          {isLoading ? 'Submitting request...' : 'Submit'}
        </Button>
      </form>

      {responseMessage && (
        <div className={`mt-4 p-2 ${responseMessage.toLowerCase().includes('error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {responseMessage}
        </div>
      )}
    </div>
  );
}