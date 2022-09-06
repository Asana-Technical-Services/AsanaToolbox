import styled from "styled-components";

const TaskDisplayContainer = styled.div`
  flex-grow: 1;
  flex-shrink: 0;
  flex-basis: 30%;
  margin: 2rem;
  text-align: left;
  overflow-y: scroll;
`;

const FieldListContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const FieldRow = styled.div`
  display: flex;
  text-align: left;
  align-content: center;
  padding-left: 12px;
`;

const FieldLabel = styled.div`
  flex: none;
  width: 108px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  color: rgb(111, 119, 130);
  padding-top: 4px;
  padding-bottom: 4px;
  padding-right: 12px;
`;

const FieldValue = styled.div`
  font-size: 14px;
  color: rgb(21, 27, 38);
  padding-top: 4px;
  padding-bottom: 4px;
  padding-right: 12px;
`;

const TaskName = styled.div`
  font-size: 24px;
  font-weight: bold;
  padding-top: 4px;
  padding-bottom: 4px;
  padding-right: 12px;
`;

const InfoBar = styled.div`
  font-size: 14px;
  margin: 10px;
`;

interface TaskDisplayProps {
  currentTaskData: any;
  latestDate: any;
  backFunction: () => void;
}
function TaskDisplay(props: TaskDisplayProps) {
  return (
    <TaskDisplayContainer>
      <button onClick={props.backFunction}>{"< select another task"}</button>
      <InfoBar>As of {props.latestDate}:</InfoBar>
      <FieldListContainer>
        <FieldRow>
          <TaskName>{props.currentTaskData.name}</TaskName>
        </FieldRow>

        <FieldRow>
          <FieldLabel>{"Assignee"}</FieldLabel>
          <FieldValue>{props.currentTaskData.assignee?.name || "–"}</FieldValue>
        </FieldRow>
        <FieldRow>
          <FieldLabel>{"Due Date"}</FieldLabel>
          <FieldValue>
            {props.currentTaskData.start_on &&
              props.currentTaskData.start_on + " – "}
            {props.currentTaskData.due_on}
          </FieldValue>
        </FieldRow>
        <FieldRow>
          <FieldLabel>{"Projects"}</FieldLabel>
          <FieldValue>
            {props.currentTaskData.memberships?.map(
              (membership: { project: any; section: any }) => {
                return (
                  <div key={membership.project.gid}>
                    {membership.project.name + " : " + membership.section?.name}
                  </div>
                );
              }
            )}
          </FieldValue>
        </FieldRow>
        {props.currentTaskData.custom_fields?.map((field: any) => (
          <FieldRow key={field.name}>
            <FieldLabel>{field.name}</FieldLabel>
            <FieldValue>{field.display_value || "–"}</FieldValue>
          </FieldRow>
        ))}
        <FieldRow>
          <FieldLabel>Description</FieldLabel>
          <FieldValue>{props.currentTaskData.notes}</FieldValue>
        </FieldRow>
      </FieldListContainer>
    </TaskDisplayContainer>
  );
}

export default TaskDisplay;
