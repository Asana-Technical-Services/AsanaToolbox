import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { STORY_TYPES } from "../utils/getTaskHistory";

const TimelineWrapper = styled.div`
  padding: 2rem 0rem;
  flex-grow: 1;
  flex-basis: 30%;
  flex-shrink: 1;
  text-align: left;
  background: #f6f8f9;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const StoryUnit = styled.div`
  font-size: 14px;
  display: flex;
  padding: 10px 4px;
`;

const StoryDate = styled.span`
  font-size: 12px;
  color: rgb(111, 119, 130);
`;

const StoryDesc = styled.div`
  flex-grow: 1;
  height: 100%;
  margin: auto;
  margin-left: 2rem;
  color: rgb(21, 27, 38);
`;

const StoryButton = styled.button`
  text-align: left;
  cursor: pointer;
  background: none;
  padding: 0px;
  width: 100%;
  border: none;
  background: none;
  border-bottom: 3px solid transparent;
  &: hover {
    border-bottom: 3px solid lightblue;
  }
  font-size: 12px;
`;

const CommentStory = styled.div`
  margin-left: 2rem;
  text-align: left;
  background: none;
  font-size: 14px;
  padding: 10px 4px;
  width: 100%;
  font-size: 14px;
`;

const SelectedStory = styled.div`
  border: none;
  background: none;
  text-align: left;
  border-bottom: 3px solid lightblue;
  padding: 0px;
  margin: 0px;
  width: 100%;
  font-size: 12px;
`;

const ScrollContainer = styled.div`
  overflow-x: hidden;
  background: none;
`;

const TimelineTitle = styled.h3`
  padding-left: 2rem;
`;

const TimelineConfig = styled.div`
  padding-left: 2rem;
  font-size: 12px;
  color: grey;
`;

interface TimelineProps {
  currentStoryGid: string;
  selectNewStory: (dex: string, date: string) => void;
  stories: Array<any>;
}

//TODO: break this down a little further into separate, better defined components

function Timeline(props: TimelineProps) {
  const [showComments, setShowComments] = useState(false);
  const scrollContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainer.current) {
      scrollContainer.current.scrollTop = scrollContainer.current.scrollHeight;
    }
  }, []);

  return (
    <TimelineWrapper>
      <TimelineTitle>Timeline</TimelineTitle>
      <TimelineConfig>
        <label>
          <input
            id="allowComments"
            type="checkbox"
            checked={showComments}
            onChange={(e) => {
              setShowComments(!showComments);
            }}
          />
          show comments
        </label>
      </TimelineConfig>
      <ScrollContainer ref={scrollContainer}>
        <div key={"original"}>
          {"original" === props.currentStoryGid ? (
            <SelectedStory>
              <StoryUnit>
                <StoryDesc>{"Original Task"}</StoryDesc>
              </StoryUnit>
            </SelectedStory>
          ) : (
            <StoryButton
              onClick={() => {
                props.selectNewStory("original", "1970-01-01");
              }}
            >
              <StoryUnit>
                <StoryDesc>{"Original Task"}</StoryDesc>
              </StoryUnit>
            </StoryButton>
          )}
        </div>
        {props.stories.map((story, dex) => {
          let storyDate = new Date(story?.created_at);
          if (STORY_TYPES.includes(story.resource_subtype)) {
            return (
              <div key={story.gid}>
                {story.gid === props.currentStoryGid ? (
                  <SelectedStory>
                    <StoryUnit>
                      <StoryDesc>
                        <b>{story?.created_by?.name}</b> {story?.text}
                        {". "}
                        <StoryDate>
                          {storyDate.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </StoryDate>
                      </StoryDesc>
                    </StoryUnit>
                  </SelectedStory>
                ) : (
                  <StoryButton
                    onClick={() => {
                      props.selectNewStory(story.gid, story?.created_at);
                    }}
                  >
                    <StoryUnit>
                      <StoryDesc>
                        <b>{story?.created_by?.name}</b> {story?.text}
                        {". "}
                        <StoryDate>
                          {storyDate.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </StoryDate>
                      </StoryDesc>
                    </StoryUnit>
                  </StoryButton>
                )}
              </div>
            );
          } else if (
            story.resource_subtype === "comment_added" &&
            showComments
          ) {
            return (
              <CommentStory>
                <b>{story?.created_by?.name}</b>
                <StoryDate>
                  {storyDate.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </StoryDate>
                <div>{story?.text}</div>
              </CommentStory>
            );
          } else {
            return "";
          }
        })}

        <StoryUnit>
          <StoryDesc>
            <b>Today</b>
          </StoryDesc>
        </StoryUnit>
      </ScrollContainer>
    </TimelineWrapper>
  );
}

export default Timeline;
