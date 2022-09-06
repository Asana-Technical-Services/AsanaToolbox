import { useState } from "react";

const apps = ["TaskHistory"];

function AppDisplay() {
  return (
    <div>
      <div>
        <div>Header</div>
        <div>
          {apps.map((app) => (
            <div>
              <div> app</div>
              <div>
                <a href={`/apps/${app}`}>{app}</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AppDisplay;
