import { useState } from "react";
import TaskDisplay from "./TaskDisplay";
import Timeline from "./Timeline";
import styled from "styled-components";

const TaskHistoryWrapper = styled.div`
  display: flex;
  height: 100%;
  align-items: stretch;
`;

interface TaskHistoryProps {
  setCurrentTaskId: (id: string) => void;
  stories: Array<any>;
  taskHistory: Map<string, any>;
}

function TaskHistoryContainer(props: TaskHistoryProps) {
  const [currentTaskData, setCurrentTaskData] = useState(
    props.taskHistory.get("today")
  );
  const [currentStoryGid, setCurrentStoryGid] = useState("today");
  const [latestDate, setLatestDate] = useState("today");

  const currentStoryGidHandler = (storyGid: string, latestDate: string) => {
    let newLatestDate = new Date(latestDate);
    setCurrentStoryGid(storyGid);
    setCurrentTaskData(props.taskHistory.get(storyGid));
    setLatestDate(
      newLatestDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    );
  };
  const backButtonHandler = () => {
    props.setCurrentTaskId("");
  };

  return (
    <TaskHistoryWrapper>
      <TaskDisplay
        currentTaskData={currentTaskData}
        latestDate={latestDate}
        backFunction={backButtonHandler}
      />
      <Timeline
        currentStoryGid={currentStoryGid}
        selectNewStory={currentStoryGidHandler}
        stories={props.stories}
      />
    </TaskHistoryWrapper>
  );
}

export default TaskHistoryContainer;
