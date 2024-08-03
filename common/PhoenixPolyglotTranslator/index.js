import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Skeleton, Button, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import axios from 'axios';

export default function SplashPage() {
  const { data: session } = useSession();

  const [sourceLanguage, setSourceLanguage] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');
  const [selectedWorkspace, setSelectedWorkspace] = useState('');
  const [ready, setReady] = useState(false);
  const [workspaces, setAvailableWorkspaces] = useState([]);
  const [responseMessage,setResponseMessage] = useState(null)

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
    setReady(false)

    try {
      const response = await axios.post('/api/apps/PhoenixPolyglotTranslator', {
        sourceLanguage,
        targetLanguage,
        workspace: selectedWorkspace,
      });

      console.log('Response from server:', response.data);
      setResponseMessage(response.data)
      setReady(true)
      setTimeout(()=>{
        setResponseMessage(null)
      },10000)
    } catch (error) {
      console.error('Error submitting form:', error);
      setResponseMessage(error)
      setTimeout(()=>{
        setResponseMessage(null)
      },10000)
      setReady(true)
    }
    setReady(true)

  };

  return (
    <div className="px-4 py-2 m-auto my-20 max-w-2xl flex flex-col content-center">
      <div className="text-4xl  w-auto">Phoenix Polyglot Translator</div>
      <br></br>
      <div>Enter your source language as the language your current environment is in, and the target language you'd like to translate the environment to </div>
      
      {/* Form to capture source and target languages */}
      <form onSubmit={handleFormSubmit} className="mt-4">
        <TextField
          label="Source Language"
          value={sourceLanguage}
          onChange={(e) => setSourceLanguage(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Target Language"
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
          required
          fullWidth
          margin="normal"
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
        <Button type="submit" disabled={!ready} fullWidth>
          Submit
        </Button>
      </form>
      {responseMessage&&(
        <div>
          {responseMessage}
        </div>
      )}
    </div>
  );
}