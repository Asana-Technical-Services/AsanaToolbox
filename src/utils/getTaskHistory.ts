import axios from "axios";
const ASANA_URL = "https://app.asana.com/api/1.0/";

const cloneDeep = require("lodash/cloneDeep");
export const STORY_TYPES = [
  "due_date_changed",
  "assigned",
  "added_to_project",
  "removed_from_project",
  "section_changed",
  "notes_changed",
  "name_changed",
  "enum_custom_field_changed",
  "number_custom_field_changed",
  "text_custom_field_changed",
  "multi_enum_custom_field_changed",
];

export const getTaskHistory = async (id: string, accessToken: string) => {
  try {
    const task = await getTask(id, accessToken);
    let stories = await getAllStories(id, accessToken);
    const taskHistory = await taskHistoryFromStories(task, stories);

    return { stories, taskHistory };
  } catch (err) {
    console.log("error!");
    return { stories: [], taskHistory: new Map() };
  }
};

const taskHistoryFromStories = async (
  task: any,
  stories: Array<any>
): Promise<Map<string, any>> => {
  let currentTask = task;

  // create a map of story Gid to a task state after that story action
  // two special states, "today" being the latest and "original" being the first
  let taskHistory: Map<string, any> = new Map();
  taskHistory.set("today", currentTask);

  //iterate backwards through stories
  for (let i = stories.length - 1; i >= 0; i--) {
    if (STORY_TYPES.includes(stories[i].resource_subtype)) {
      taskHistory.set(stories[i].gid, currentTask);
      currentTask = revertTask(i, stories, currentTask);
    }

    taskHistory.set("original", currentTask);
  }

  return taskHistory;
};

const getTask = async (taskId: string, accessToken: string) => {
  const client = axios.create({
    baseURL: ASANA_URL,
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  try {
    const taskResponse = await client.get(
      `tasks/${taskId}?opt_fields=name,assignee.(name|gid),projects,custom_fields,memberships.(project|section).(name|gid),due_on,due_at,start_on,start_at,notes,resource_subtype,completed,approval_status`
    );
    console.log(taskResponse.data.data);
    return taskResponse.data.data;
  } catch (err) {
    if (err) {
    }
    console.log("error message", err);
    return {};
  }
};

const getAllStories = async (
  taskId: string,
  accessToken: string
): Promise<Array<any>> => {
  const client = axios.create({
    baseURL: ASANA_URL,
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  try {
    const storyResponse = await client.get(
      `tasks/${taskId}/stories?opt_fields=project.(name|color),custom_field,created_at,created_by.name,resource_subtype,old_resource_subtype,new_resource_subtype,type,text,new_value,old_value,new_text_value,old_text_value,old_number_value,new_number_value,old_name,new_name,old_enum_value,,new_enum_value,old_multi_enum_values,new_multi_enum_values,old_dates,new_dates,old_approval_status,new_approval_status,old_section.(name|project),new_section.(name|project),created_by,assignee.(gid|name),html_text`
    );
    let stories = storyResponse.data.data;
    if (stories.length) {
      return stories;
    } else {
      return [{}];
    }
  } catch (err) {
    console.log(err);
    return [{}];
  }
};

const revertTask = (i: number, stories: Array<any>, currentTask: any) => {
  // reverts the task. Different handlers for different story types.
  // TODO: further break down these to separate functions:

  let j = i;

  // duplicate the task object so we don't modify the original object
  let newTask = cloneDeep(currentTask);

  // story type handlers:
  // TODO: track dependencies

  //#################### change completion status ####################
  if (
    ["changes_requested", "approved", "rejected"].includes(
      stories[j].resource_subtype
    )
  ) {
    newTask.approval_status = stories[j].old_approval_status || "pending";
  } else if (stories[j].resource_subtype === "marked_complete") {
    newTask.completed = false;
  } else if (stories[j].resource_subtype === "marked_incomplete") {
    newTask.completed = true;
    //#################### changed between different resource subtypes (milestone, approval, etc) ####################
  } else if (stories[j].resource_subtype === "resource_subtype_changed") {
    //  resource subtype:

    newTask.resource_subtype = stories[j].old_resource_subtype;

    //#################### Assigned ####################
  } else if (stories[j].resource_subtype === "assigned") {
    console.log(j, i, stories[j]);
    j--;
    console.log(j, i, stories[j]);
    while (j >= 0 && stories[j].resource_subtype !== "assigned") {
      j--;
    }
    console.log(j, i);
    if (j < 0) {
      newTask.assignee = { gid: "", name: "unassigned" };
      console.log(newTask.assignee);
    } else {
      newTask.assignee = stories[j].assignee;
      console.log(newTask.assignee);
    }

    // #################### Date Change ####################
  } else if (stories[j].resource_subtype === "due_date_changed") {
    newTask.due_on = stories[j].old_dates?.due_on;
    newTask.due_at = stories[j].old_dates?.due_at;
    newTask.start_on = stories[j].old_dates?.start_on;
    newTask.start_at = stories[j].old_dates?.start_at;

    // #################### Added to project  ####################
  } else if (stories[j].resource_subtype === "added_to_project") {
    for (let k = 0; k < newTask.projects.length; k++) {
      if (newTask.projects[k].gid === stories[j].project.gid) {
        newTask.projects.splice(k, 1);
        break;
      }
    }

    for (let k = 0; k < newTask.memberships.length; k++) {
      console.log(newTask.memberships[k].project?.gid);
      console.log(stories[j].project.gid);
      if (newTask.memberships[k].project?.gid === stories[j].project.gid) {
        newTask.memberships.splice(k, 1);
        break;
      }
    }
    // #################### Removed from project ####################
  } else if (stories[j].resource_subtype === "removed_from_project") {
    newTask.projects.push(stories[j].project);
    let oldSection = {};
    // go backwards to see if we can find the last section change
    for (let k = j - 1; k > 0; k--) {
      if (
        stories[k].resource_subtype === "section_changed" &&
        stories[k].new_section.project.gid === stories[j].project
      ) {
        oldSection = {
          name: stories[k].new_section?.name,
          gid: stories[k].new_section?.gid,
        };
        break;
      }
    }
    newTask.memberships.push({
      project: stories[j].project,
      section: oldSection,
    });
    // #################### Notes ####################
  } else if (stories[j].resource_subtype === "notes_changed") {
    newTask.notes = stories[j].old_value;
    // #################### Name ####################
  } else if (stories[j].resource_subtype === "name_changed") {
    newTask.name = stories[j].old_name;

    // #################### Section ####################
  } else if (stories[j].resource_subtype === "section_changed") {
    for (let k = 0; k < newTask.memberships.length; k++) {
      if (
        newTask.memberships[k].project.gid ===
        stories[j].new_section.project.gid
      ) {
        newTask.memberships[k].section = {
          name: stories[j].old_section?.name || "Untitled section",
          gid: stories[j].old_section?.gid || "",
        };
        break;
      }
    }

    // #################### CF - ENUM  ####################
  } else if (stories[j].resource_subtype === "enum_custom_field_changed") {
    for (let k = 0; k < newTask.custom_fields.length; k++) {
      if (newTask.custom_fields[k].gid === stories[j].custom_field.gid) {
        newTask.custom_fields[k].enum_value = stories[j].old_enum_value;
        newTask.custom_fields[k].display_value =
          stories[j].old_enum_value?.name;
        break;
      }
    }
    // #################### CF - NUMBER ####################
  } else if (stories[j].resource_subtype === "number_custom_field_changed") {
    for (let k = 0; k < newTask.custom_fields.length; k++) {
      if (newTask.custom_fields[k].gid === stories[j].custom_field.gid) {
        newTask.custom_fields[k].number_value = stories[j].old_number_value;
        newTask.custom_fields[k].display_value = String(
          stories[j].old_number_value
        );
        break;
      }
    }
    // #################### CF - TEXT ####################
  } else if (stories[j].resource_subtype === "text_custom_field_changed") {
    for (let k = 0; k < newTask.custom_fields.length; k++) {
      if (newTask.custom_fields[k].gid === stories[j].custom_field.gid) {
        newTask.custom_fields[k].text_value = stories[j].old_text_value;
        newTask.custom_fields[k].display_value = stories[j].old_text_value;
        break;
      }
    }

    // #################### CF MULTI-ENUM ####################
  } else if (
    stories[j].resource_subtype === "multi_enum_custom_field_changed"
  ) {
    for (let k = 0; k < newTask.custom_fields.length; k++) {
      if (newTask.custom_fields[k].gid === stories[j].custom_field.gid) {
        newTask.custom_fields[k].multi_enum_values =
          stories[j].old_multi_enum_values;
        newTask.custom_fields[k].display_value = stories[
          j
        ].old_multi_enum_values
          ?.map((value: { name: string }) => value?.name)
          .join(", ");
        break;
      }
    }

    // ### TODO: Parse rich text comments

    // } else if (stories[j].resource_subtype === "comment_added") {
    //   let htmlText = stories[j].html_text;
    //   let end;
    //   const parser = new DOMParser();
    //   const doc = parser.parseFromString(htmlText, "text/html");
    //   const iterator = doc.evaluate(
    //     '//a[@data-asana-type="user"]/@data-asana-gid',
    //     doc,
    //     null,
    //     XPathResult.ORDERED_NODE_ITERATOR_TYPE
    //   );
    //   let node = iterator.iterateNext();
    //   while (node) {
    //     console.log(node.nodeValue);
    //     end = end + (node.nodeValue || "");
    //     node = iterator.iterateNext();
    //   }
  }

  return newTask;
};
