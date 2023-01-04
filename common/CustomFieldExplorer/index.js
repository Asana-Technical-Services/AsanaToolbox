import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  Chip,
  Skeleton,
} from "@mui/material";
import axios from "axios";

export default function SplashPage() {
  const { data: session } = useSession();
  const [workspace, setWorkspace] = useState("none");
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);
  const [availableWorkspaces, setAvailableWorkspaces] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [currentFieldView, setCurrentFieldView] = useState([]);
  const [sort, setSort] = useState({});
  const [loadingFields, setLoadingFields] = useState(false);
  const [apology, setApology] = useState(false);
  const [failure, setFailure] = useState(false);

  useEffect(() => {
    if (loadingWorkspaces === true && session && session.access_token) {
      axios
        .get(
          "https://app.asana.com/api/1.0/users/me/workspace_memberships?opt_fields=is_guest,is_active,workspace.name,",
          {
            headers: { Authorization: `Bearer ${session?.access_token}` },
          }
        )
        .then((space_memberships_response) => {
          if (space_memberships_response?.data?.data?.length > 0) {
            let full_memberships = space_memberships_response.data.data.filter(
              (membership) => membership.is_active && !membership.is_guest
            );
            let spaces = full_memberships.map(
              (membership) => membership.workspace
            );
            setAvailableWorkspaces(spaces);
            setLoadingWorkspaces(false);
          }
        });
    }
  }, [session]);

  useEffect(() => {
    sortFields();
  }, [sort]);

  const handleWorkspaceChange = (e) => {
    if (e.target.value && e.target.value != "none") {
      setWorkspace(e.target.value);
      getCustomFieldsForWorkspace(e.target.value);
    } else {
      setWorkspace("none");
      setCustomFields([]);
      setCurrentFieldView([]);
    }
  };

  const getCustomFieldsForWorkspace = async (workspaceGid) => {
    setLoadingFields(true);
    setFailure(false);
    let apologyTimer = setTimeout(() => {
      setApology(true);
    }, 4000);

    let hasMore = true;
    let newList = [];
    let offset = null;

    while (hasMore) {
      let cfResult = await axios.get(
        `https://app.asana.com/api/1.0/workspaces/${workspaceGid}/custom_fields?opt_fields=gid,type,name,description,enum_options,created_by.(name|email)&limit=100${
          offset ? "&offset=" + offset : ""
        }`,
        {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        }
      );

      if (cfResult.status == 402) {
        setFailure(true);
        clearTimeout(apologyTimer);
        setLoadingFields(false);
        setApology(false);
        hasMore = false;
        return;
      } else if (cfResult.status == 429) {
        //slowing down, hit rate limits
        
      } else if (cfResult?.data?.data) {
        if (cfResult.data.next_page?.offset) {
          newList = newList.concat(cfResult.data.data);
          offset = cfResult.data.next_page?.offset;
        } else {
          newList = newList.concat(cfResult.data.data);
          setCustomFields(newList);
          setCurrentFieldView(newList);
          setLoadingFields(false);
          clearTimeout(apologyTimer);
          setApology(false);
          hasMore = false;
          return;
        }
      }
    }
  };

  const changeSort = (sortKey) => {
    let currentKey = sort.key;
    let currentSortAscending = sort.asc;

    if (!sortKey || sortKey == "") {
      setSort({ key: "", asc: true });
    } else if (currentKey != sortKey) {
      setSort({ key: sortKey, asc: true });
    } else if (currentKey == sortKey && currentSortAscending) {
      setSort({ key: sortKey, asc: false });
    } else {
      setSort({ key: "", asc: true });
    }
  };

  const sortFields = () => {
    if (sort.key == "") {
      setCurrentFieldView(customFields);
    } else {
      let newFieldsOrder = [...customFields];
      newFieldsOrder = newFieldsOrder.sort((a, b) => {
        if (a[sort.key] == b[sort.key]) {
          return 0;
        }
        if (sort.key == "created_by") {
          return (
            (sort.asc ? -1 : 1) *
              a[sort.key]?.name.localeCompare(b[sort.key]?.name) || 1
          );
        } else {
          return (
            (sort.asc ? -1 : 1) * a[sort.key]?.localeCompare(b[sort.key]) || 1
          );
        }
      });
      setCurrentFieldView(newFieldsOrder);
    }
  };

  const exportToCsv = () => {
    let headers = [
      "gid",
      "name",
      "type",
      "description",
      "options",
      "created_by_email",
      "created_by_name",
    ];

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += headers.map((h) => '"' + h + '"').join(",");
    csvContent += "\n";

    let customFieldCsvData = customFields
      .map((cf) => {
        let rowString = "";
        rowString += headers
          .map((key) => {
            if (key == "options") {
              return (
                '"' +
                (cf.enum_options?.map((opt) => opt.name).join(",") || "") +
                '"'
              );
            } else if (key == "created_by_email") {
              return '"' + (cf.created_by?.email || "") + '"';
            } else if (key == "created_by_name") {
              return '"' + (cf.created_by?.email || "") + '"';
            } else {
              return '"' + cf[key] + '"';
            }
          })
          .join(",");
        return rowString;
      })
      .join("\n");

    csvContent += customFieldCsvData;
    let encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "custom_field_export.csv");
    document.body.appendChild(link);

    link.click();
  };

  return (
    <div className="h-full max-h-screen overflow-none m-auto flex flex-col pt-24 -mt-12">
      <div className="py-12 flex flex-row justify-between w-full">
        <div className="text-4xl  w-auto">Custom Field Explorer</div>
        <button
          className={
            "rounded-xl p-2 m-2  align-center justify-self-center text-gray-50 " +
            (workspace == "none"
              ? "bg-gray-300 cursor-not-allowed"
              : " bg-blue-500 ")
          }
          onClick={customFields?.length > 0 ? exportToCsv : () => {}}
        >
          Download as CSV
        </button>
      </div>

      <div className=" my-4">
        <FormControl fullWidth>
          <InputLabel id="workspace-selector">Workspace</InputLabel>
          <Select
            labelId="workspace-selector"
            id="workspace-simple-select"
            value={workspace}
            label="Workspaces"
            onChange={handleWorkspaceChange}
          >
            <MenuItem value="none">Select a workspace</MenuItem>
            {availableWorkspaces.map((space) => (
              <MenuItem value={space.gid}>{space.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <div className="w-full overflow-x-auto">
        <div>
          {loadingFields && (
            <div>
              <Skeleton></Skeleton>
              <Skeleton></Skeleton>
              <Skeleton></Skeleton>
              <Skeleton></Skeleton>
            </div>
          )}
          {apology && (
            <div>
              This is taking longer than expected. You sure have a lot of
              fields!
            </div>
          )}
          {failure && (
            <div>
              {
                "Sorry, custom Fields are not available for free users or guests. Choose another workspace."
              }
            </div>
          )}
          {customFields?.length > 0 && (
            <div
              className="table border-collapse  max-w-full"
              size="medium"
              aria-label="a table of all custom fields"
            >
              <div className="table-header-group sticky top-0">
                <div className="table-row border divide-x  divide-slate-300 border-slate-300">
                  <div
                    onClick={() => {
                      changeSort("gid");
                    }}
                    className="table-cell bg-clip-padding  bg-white cursor-pointer  p-2 font-bold"
                    align="left"
                  >
                    Global ID
                    {sort.key == "gid" && (sort.asc ? " ^" : " v")}
                  </div>
                  <div
                    className="table-cell bg-clip-padding  bg-white cursor-pointer p-2 font-bold"
                    onClick={() => {
                      changeSort("name");
                    }}
                  >
                    Name
                    {sort.key == "name" && (sort.asc ? " ^" : " v")}
                  </div>
                  <div
                    onClick={() => {
                      changeSort("type");
                    }}
                    className="table-cell bg-clip-padding bg-white cursor-pointer p-2 font-bold"
                    align="left"
                  >
                    Type
                    {sort.key == "type" && (sort.asc ? " ^" : " v")}
                  </div>
                  <div
                    onClick={() => {
                      changeSort("description");
                    }}
                    className="table-cell bg-clip-padding bg-white cursor-pointer p-2 font-bold"
                    align="left"
                  >
                    Description
                    {sort.key == "description" && (sort.asc ? " ^" : " v")}
                  </div>
                  <div
                    className="table-cell p-2 bg-clip-padding bg-white font-bold"
                    align="left"
                  >
                    Options
                  </div>

                  <div
                    onClick={() => {
                      changeSort("created_by");
                    }}
                    className="table-cell bg-clip-padding bg-white cursor-pointer  p-2 font-bold"
                    align="left"
                  >
                    Created By
                    {sort.key == "created_by" && (sort.asc ? " ^" : " v")}
                  </div>
                </div>
              </div>
              <div className="table-row-group">
                {currentFieldView.map((cf) => (
                  <div className="table-row " key={cf.gid}>
                    <div
                      className="table-cell border border-slate-300 p-2"
                      align="right"
                    >
                      {cf.gid}
                    </div>
                    <div className=" table-cell border border-slate-300  p-2">
                      {cf.name}
                    </div>
                    <div
                      className="table-cell  border border-slate-300 p-2"
                      align="right"
                    >
                      {cf.type}
                    </div>
                    <div
                      className="table-cell  border border-slate-300 p-2"
                      align="right"
                    >
                      {cf.description}
                    </div>
                    <div className="table-cell border border-slate-300 p-2  overflow-y-scroll overflow-x-scroll ">
                      {cf.enum_options?.map((option) => (
                        <Chip
                          key={option.gid}
                          label={option.name}
                          variant="outlined"
                        />
                      ))}
                    </div>

                    <div
                      className="table-cell border border-slate-300 p-2"
                      align="right"
                    >
                      {cf.created_by?.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const customFilter = (object, key, searchTerm) => {
  if (key === "enum_options") {
    for (let option of object["enum_options"]) {
      if (option.name.contains(searchTerm)) {
        return true;
      }
    }
    return false;
  } else if (key == "created_by") {
    return object[key]?.name.contains(searchTerm);
  } else {
    return object[key]?.contains(searchTerm);
  }
  return true;
};
