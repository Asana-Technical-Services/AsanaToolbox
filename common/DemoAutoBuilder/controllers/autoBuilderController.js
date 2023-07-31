/* eslint-disable import/prefer-default-export */
/* TODO: Remove above */
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '../../../pages/api/auth/[...nextauth]';
import { buildWorkGraph, submitOpenAiPrompt } from '../services';

export const config = {
  runtime: 'edge',
};

export async function handleFormData(req, res) {
  // const session = await getServerSession(req, res, authOptions);
  const session = await getServerSession(req, res, authOptions);
  const reqData = req?.body;
  // eslint-disable-next-line no-unused-vars
  const userGid = req?.query?.user; // TODO: implement userGid assignee
  const workspaceGid = req?.query?.workspace;
  const accessToken = session?.access_token;
  const companySize = reqData?.company_size;
  const industry = reqData?.industry;
  const projectType = reqData?.project_type;
  const departments = reqData?.departments;
  const datetime = new Date();
  const currentDate = datetime.toISOString().slice(0, 10);
  const jsonSchema = `
  {
    "parent_portfolio": {
      "portfolio_name": ...,
      "portfolios": [
        {
          "portfolio_name": ...,
          "projects": [
            {
              "project_name": ...,
              "sections": [
                {
                  "section_name": ...,
                  "tasks": [
                    {
                      "task_name": ...,
                      "due_date": ...
                    },
                  ]
                },
              ]
            },
          ]
        },
   }
  `;

  const promptMessage = `
    Given Asana's work graph structure, including portfolios, projects within those portfolios, \
    and tasks within those projects, can you generate me real-life workflows for the following departments:
    ${departments} for an ${companySize} sized company in the ${industry}  Please come up with real-world naming examples \
    for the parent portfolio name, the portfolio names, the project names, the section names, and the task names. \
    Separate each of these "workflows" by portfolios in the data structure about to be specified. Also create the breakdown \
    of "sections" in each of these projects. Make each of the sections of the ${projectType} style workflow. \
    Assume all projects will follow the same structure. Please also generate example tasks, the amount of tasks in each section is \
    at your discretion, for each based off the theme of the sections. Generate at least 3 or more tasks per section in each project. \
    Generate at least 2 or more projects per portfolio.  Generate your answer as neatly formed JSON that can be consumed by another platform.
    Use the following JSON structure: ${jsonSchema}.
    Simulate the "due_date"(s) for each task starting in this current date ${currentDate}. \
    Do not generate other text in your response aside from the JSON object itself. 
  `;

  const response = res.waitUntil(submitOpenAiPrompt(promptMessage));
  let parsedData;
  try {
    parsedData = JSON.parse(response);
  } catch (e) {
    /* TODO: Handle error */
  }
  if (!parsedData) {
    /* TODO: handle error */
    return null;
  }
  console.log(JSON.stringify(parsedData));
  const returnObject = res.waitUntil(
    buildWorkGraph(accessToken, workspaceGid, parsedData)
  );
  return NextResponse.json(returnObject);
}
