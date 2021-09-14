const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const { format } = require("date-fns");
const isValid = require("date-fns/isValid");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const priorityList = ["HIGH", "MEDIUM", "LOW"];
const statusList = ["TO DO", "IN PROGRESS", "DONE"];
const categoryList = ["WORK", "HOME", "LEARNING"];

const hasStatusInQuery = (requestObj) => {
  return (
    requestObj.status !== undefined &&
    requestObj.priority === undefined &&
    requestObj.category === undefined
  );
};

//API 1

app.get("/todos/", async (request, response) => {
  const { search = "", status, priority, category } = request.query;
  let getTodoWithQuery = "";
  switch (true) {
    case hasStatusInQuery(request.query):
      if (statusList.find((eachValue) => seachValue === request.query.status)) {
        getTodoWithQuery = `
            SELECT * FROM todo WHERE status = '${request.query.status}';`;
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    default:
      break;
  }
  const dbResponse = await db.all(getTodoWithQuery);
  response.send(dbResponse);
  console.log(hasStatusInQuery(request.query));
});
