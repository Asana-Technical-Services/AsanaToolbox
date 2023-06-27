import { Typography, Link, List, ListItem } from '@mui/material';

function FormInfo() {
  return (
    <div>
      <Typography variant="body1">
        This workflow generates a parent portfolio, to portfolios, to projects,
        to tasks (with sections) demo environment structure based on the data
        submitted in this form. This workflow uses your Oauth credentials to
        create the Work Graph objects in your logged-in Asana workspace. (Note:
        This may take a handful of minutes to complete both getting a response
        from OpenAI as well as building the Work Grah objects. Once completed,
        the Asana URL to the portfolio will be shown at the bottom.)
      </Typography>
      <Typography variant="body1">
        If you have any questions, feel free to reach out to Andrew Williams on
        Slack! Feel free to leave any feedback in this task:
      </Typography>
      <List>
        <ListItem>
          <Link href="https://app.asana.com/0/0/1204507575048663/f">
            https://app.asana.com/0/0/1204507575048663/f
          </Link>
        </ListItem>
      </List>
    </div>
  );
}

export default FormInfo;
