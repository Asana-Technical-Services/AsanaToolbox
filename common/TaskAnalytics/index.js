import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function Component() {
  const { data: session } = useSession();

  // many requests require you to specify a workspace, so we've provided that here
  const [allRecords, setAllRecords] = useState([]);

  useEffect(() => {
    let fetchData = async () => {
      let resp = await fetch("/api/apps/TaskAnalytics/config");
      if (resp.ok) {
        let body = await resp.json();
        if (body?.Items) {
          setAllRecords(body?.Items || []);
          return;
        }
        return;
      }
    };
    fetchData();
  }, []);

  return (
    <div className="px-4 py-2 m-auto my-20 max-w-2xl flex flex-col content-center">
      <h1>Task Analyics Summary</h1>

      <div>
        <div
          className="table border-collapse  max-w-full"
          size="medium"
          aria-label="a table of all custom fields"
        >
          <div className="table-header-group sticky top-0">
            <div className="table-row border divide-x  divide-slate-300 border-slate-300">
              <div
                className="table-cell bg-clip-padding  bg-white cursor-pointer  p-2 font-bold"
                align="left"
              >
                Tracker Name
              </div>
              <div
                className="table-cell bg-clip-padding  bg-white cursor-pointer  p-2 font-bold"
                align="left"
              >
                Count
              </div>
              <div
                className="table-cell bg-clip-padding  bg-white cursor-pointer  p-2 font-bold"
                align="left"
              >
                Link to Task
              </div>
            </div>
          </div>

          <div className="table-row-group"></div>
          {allRecords.map((record) => (
            <div className="table-row " key={record.TaskID}>
              <div
                className="table-cell border border-slate-300 p-2"
                align="right"
              >
                {record.TrackerID}{" "}
              </div>

              <div
                className="table-cell border border-slate-300 p-2"
                align="right"
              >
                {record.Counter}
              </div>
              <div
                className="table-cell border border-slate-300 p-2"
                align="right"
              >
                <a
                  href={`https://app.asana.com/0/${record.TaskID}/${record.TaskID}`}
                >
                  {`https://app.asana.com/0/${record.TaskID}/${record.TaskID}`}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
