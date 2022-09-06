import { useState } from "react";
import styled from "styled-components";
import howToGetLink from "./../../public/HowToCopyTask.png";
import Image from "next/image";

const TaskFormWrapper = styled.div`
  align-content: center;
  text-align: left;
  margin: 10%;
`;
interface TaskFormProps {
  setTaskId: (taskId: string) => void;
}

function TaskForm(props: TaskFormProps) {
  const [taskIdInput, setTaskIdInput] = useState("");

  const handleSubmit = () => {
    // TODO: validate and parse input more intelligently, handle errors gracefully.
    let input = taskIdInput;
    let finalInput = input;

    let splitInputArray = input.split("/");

    if (splitInputArray.length > 1) {
      finalInput = splitInputArray[splitInputArray.length - 2];
      console.log(splitInputArray);
      console.log(finalInput);
    }
    props.setTaskId(finalInput);
  };

  return (
    <TaskFormWrapper>
      <p>reference tasks: 1200538057511646 , 1200186779257471</p>
      <h2>Paste a link to a task:</h2>
      <input
        value={taskIdInput}
        onChange={(e) => setTaskIdInput(e.target.value)}
      ></input>
      <button onClick={handleSubmit}>Get task history</button>
      <details>
        <summary>Help</summary>
        <Image
          src={howToGetLink}
          alt="click the copy link button from the task's expanded view"
        />
        <p></p>
      </details>
    </TaskFormWrapper>
  );
}

export default TaskForm;
