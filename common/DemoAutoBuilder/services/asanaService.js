import axios from 'axios';

const asana = require('asana');

let globalTeamId;
const clientMethods = {
  portfolios: 'createPortfolio',
  projects: 'createProject',
  tasks: 'createTask',
};

async function createObject(client, type, params) {
  if (!client || !type || !(type in clientMethods) || !params) {
    return null;
  }

  // Get the method to be call
  const clientMethod = clientMethods[type];
  const objectData = await client[type][clientMethod](params);
  return objectData;
}

async function getTeam(client, workspaceGid, teamName) {
  // const teams = await client.teams.getTeamsForWorkspace(workspaceGid);
  const token = client?.dispatcher?.authenticator?.credentials?.access_token;
  const response = await axios.get(
    `https://app.asana.com/api/1.0/workspaces/${workspaceGid}/teams`,
    {
      headers: { authorization: `Bearer ${token}` },
    }
  );
  const teams = response?.data?.data;
  const team = teams?.find((object) => object.name === teamName);
  const teamGid = team?.gid;
  return teamGid;
}

async function addItemToPortfolio(client, childObject, portfolio) {
  const childObjectGid = childObject?.gid;
  const portfolioGid = portfolio?.gid;
  const params = { item: childObjectGid };
  const response = await client.portfolios.addItemForPortfolio(
    portfolioGid,
    params
  );
  return response;
}

async function addTaskToSection(client, childObject, section) {
  const childObjectGid = childObject?.gid;
  const sectionGid = section?.gid;
  const params = { task: childObjectGid };
  const response = await client.sections.addTaskForSection(sectionGid, params);
  return response;
}

async function createPortfolio(client, workspaceGid, data) {
  if (!data) {
    return null;
  }
  const portfolioName = data?.portfolio_name;
  const params = {
    name: portfolioName,
    workspace: workspaceGid,
    public: true,
  };
  return createObject(client, 'portfolios', params);
}

async function createProject(client, workspaceGid, data) {
  if (!data) {
    return null;
  }
  const projectName = data?.project_name;
  const teamGid = globalTeamId;
  const params = {
    name: projectName,
    workspace: workspaceGid,
    team: teamGid,
    public: true,
  };
  return createObject(client, 'projects', params);
}

async function createSection(client, data, parentObject) {
  if (!data || !parentObject) {
    return null;
  }
  const projectGid = parentObject?.gid;
  const sectionName = data?.section_name;
  const params = { name: sectionName };
  const response = await client.sections.createSectionForProject(
    projectGid,
    params
  );
  console.log(
    `Got response from creating sections as ${JSON.stringify(response)}`
  );
  return response;
}

async function createTask(client, workspaceGid, data) {
  if (!data) {
    return null;
  }
  const taskName = data?.task_name;
  const dueDate = data?.due_date;
  const params = {
    name: taskName,
    workspace: workspaceGid,
    due_on: dueDate,
  };
  return createObject(client, 'tasks', params);
}

async function buildTree(client, workspaceGid, parentPortfolioData) {
  let success = false;
  const parentPortfolio = await createPortfolio(
    client,
    workspaceGid,
    parentPortfolioData
  );
  const portfoliosData = parentPortfolioData?.portfolios;
  try {
    await Promise.all(
      portfoliosData?.map(async (portfolioData) => {
        const portfolio = await createPortfolio(
          client,
          workspaceGid,
          portfolioData
        );
        if (portfolio) {
          console.log(
            `Created portfolio for name <${portfolio.name}> and attaching to parent portfolio <${parentPortfolio.name}>`
          );
          await addItemToPortfolio(client, portfolio, parentPortfolio);
        }

        // Loop through and create each of the projects for each portfolio
        const projectsData = portfolioData?.projects;
        await Promise.all(
          projectsData.map(async (projectData) => {
            const project = await createProject(
              client,
              workspaceGid,
              projectData
            );
            if (project) {
              console.log(
                `Created project for name <${project.name}> and attaching to parent portfolio <${portfolio.name}>`
              );
              await addItemToPortfolio(client, project, portfolio);
            }

            // Loop through and create each of the sections for each project
            const sectionsData = projectData?.sections;
            await Promise.all(
              sectionsData.map(async (sectionData) => {
                const section = await createSection(
                  client,
                  sectionData,
                  project
                );
                if (section) {
                  console.log(
                    `Created section for name <${section.name}> and attaching to parent project <${project.name}>`
                  );
                }

                // Loop through and create each of the tasks for each section
                const tasksData = sectionData?.tasks;
                await Promise.all(
                  tasksData.map(async (taskData) => {
                    const task = await createTask(
                      client,
                      workspaceGid,
                      taskData
                    );
                    if (task) {
                      console.log(
                        `Created task for name <${task.name}> and attaching to section <${section.name}>`
                      );
                      await addTaskToSection(client, task, section);
                    }
                  })
                );
              })
            );
          })
        );
      })
    );
    success = true;
  } catch (error) {
    /* TODO: Handle error */
  }
  return { success, url: parentPortfolio?.permalink_url };
}

// eslint-disable-next-line import/prefer-default-export
export async function buildWorkGraph(accessToken, workspaceGid, data) {
  const client = asana.Client.create().useAccessToken(accessToken);
  client.dispatcher.retryOnRateLimit = true; // Ensure we retry on rate limiting
  globalTeamId = await getTeam(client, workspaceGid, 'Staff');
  const parentPortfolioData = data?.parent_portfolio;

  // Loop through and create each of the portfolios
  return buildTree(client, workspaceGid, parentPortfolioData);
}
