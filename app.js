const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const { format, isValid } = require("date-fns");

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

const convertDbObjIntoJsonObj = (dbObj) => {
  return {
    id: dbObj.id,
    todo: dbObj.todo,
    priority: dbObj.priority,
    status: dbObj.status,
    category: dbObj.category,
    dueDate: dbObj.due_date,
  };
};

const hasStatusInQuery = (requestObj) => {
  return (
    requestObj.status !== undefined &&
    requestObj.priority === undefined &&
    requestObj.category === undefined
  );
};

const hasPriorityInQuery = (requestObj) => {
  return (
    requestObj.priority !== undefined &&
    requestObj.status === undefined &&
    requestObj.category === undefined
  );
};

const hasCategoryInQuery = (requestObj) => {
  return (
    requestObj.category !== undefined &&
    requestObj.priority === undefined &&
    requestObj.status === undefined
  );
};

const hasPriorityAndStatusInQuery = (requestObj) => {
  return (
    requestObj.priority !== undefined &&
    requestObj.status !== undefined &&
    requestObj.category === undefined
  );
};

const hasCategoryAndStatusInQuery = (requestObj) => {
  return (
    requestObj.category !== undefined &&
    requestObj.status !== undefined &&
    requestObj.priority === undefined
  );
};

const hasCategoryAndPriorityInQuery = (requestObj) => {
  return (
    requestObj.category !== undefined &&
    requestObj.priority !== undefined &&
    requestObj.status === undefined
  );
};

//API 1

app.get("/todos/", async (request, response) => {
  const { search_q = "", status, priority, category } = request.query;

  switch (true) {
    case hasStatusInQuery(request.query):
      if (statusList.find((eachValue) => eachValue === request.query.status)) {
        const getTodoWithStatusQuery = `
            SELECT * FROM todo WHERE status = '${request.query.status}';`;
        const dbStatus = await db.all(getTodoWithStatusQuery);
        response.send(dbStatus.map(convertDbObjIntoJsonObj));
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case hasPriorityInQuery(request.query):
      if (
        priorityList.find((eachValue) => eachValue === request.query.priority)
      ) {
        const getTodoWithPriorityQuery = `
            SELECT * FROM todo WHERE priority = '${request.query.priority}';`;
        const dbPriority = await db.all(getTodoWithPriorityQuery);
        response.send(dbPriority.map(convertDbObjIntoJsonObj));
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case hasPriorityAndStatusInQuery(request.query):
      let isPriorityValid = priorityList.find(
        (eachValue) => eachValue === request.query.priority
      );
      let isStatusValid = statusList.find(
        (eachValue) => eachValue === request.query.status
      );

      if (isPriorityValid && isStatusValid) {
        const getTodoWithPriorityAndStatusQuery = `
            SELECT * FROM todo WHERE 
            priority = '${request.query.priority}'
            AND status = '${request.query.status}';`;
        const dbPriorityAndStatus = await db.all(
          getTodoWithPriorityAndStatusQuery
        );
        response.send(dbPriorityAndStatus.map(convertDbObjIntoJsonObj));
      } else {
        if (!isPriorityValid) {
          response.status(400);
          response.send("Invalid Todo Priority");
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      }
      break;
    case hasCategoryAndStatusInQuery(request.query):
      let isCategoryValid = categoryList.find(
        (eachValue) => eachValue === request.query.category
      );
      let isValidStatus = statusList.find(
        (eachValue) => eachValue === request.query.status
      );

      if (isCategoryValid && isValidStatus) {
        const getTodoWithCategoryAndStatusQuery = `
            SELECT * FROM todo WHERE 
            category = '${request.query.category}'
            AND status = '${request.query.status}';`;
        const dbCategoryAndStatus = await db.all(
          getTodoWithCategoryAndStatusQuery
        );
        response.send(dbCategoryAndStatus.map(convertDbObjIntoJsonObj));
      } else {
        if (!isCategoryValid) {
          response.status(400);
          response.send("Invalid Todo Category");
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      }
      break;
    case hasCategoryInQuery(request.query):
      if (
        categoryList.find((eachValue) => eachValue === request.query.category)
      ) {
        const getTodoWithCategoryQuery = `
            SELECT * FROM todo WHERE category = '${request.query.category}';`;
        const dbCategory = await db.all(getTodoWithCategoryQuery);
        response.send(dbCategory.map(convertDbObjIntoJsonObj));
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case hasCategoryAndPriorityInQuery(request.query):
      let isValidCategory = categoryList.find(
        (eachValue) => eachValue === request.query.category
      );
      let isValidPriority = priorityList.find(
        (eachValue) => eachValue === request.query.priority
      );

      if (isValidCategory && isValidPriority) {
        const getTodoWithCategoryAndPriorityQuery = `
            SELECT * FROM todo WHERE 
            category = '${request.query.category}'
            AND priority = '${request.query.priority}';`;
        const dbCategoryAndPriority = await db.all(
          getTodoWithCategoryAndPriorityQuery
        );
        response.send(dbCategoryAndPriority.map(convertDbObjIntoJsonObj));
      } else {
        if (!isValidCategory) {
          response.status(400);
          response.send("Invalid Todo Category");
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      }
      break;
    default:
      const getTodoQuery = `
        SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`;
      const dbData = await db.all(getTodoQuery);
      response.send(dbData.map(convertDbObjIntoJsonObj));
  }
});

//API 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoWithIdQuery = `
    SELECT *
    FROM todo
    WHERE
      id = ${todoId};`;
  const dbDataWithTodoId = await db.get(getTodoWithIdQuery);
  response.send(convertDbObjIntoJsonObj(dbDataWithTodoId));
});

//API 3

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  if (isValid(new Date(date))) {
    let givenDate = format(new Date(date), "yyyy-MM-dd");
    const getTodoWithDuedateQuery = `
      SELECT * FROM todo
      WHERE due_date = '${givenDate}';`;
    const dbWithDueDate = await db.all(getTodoWithDuedateQuery);
    response.send(dbWithDueDate.map(convertDbObjIntoJsonObj));
  } else {
    response.status(400).send("Invalid Due Date");
  }
});

//API 4
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  const validateDate = isValid(new Date(dueDate));
  const validateCategory = categoryList.find(
    (each) => each === request.body.category
  );
  const validateStatus = statusList.find(
    (each) => each === request.body.status
  );
  const validatePriority = priorityList.find(
    (each) => each === request.body.priority
  );
  let bothDateAndCategoryValid = validateDate && validateCategory;
  let bothStatusAndPriorityValid = validatePriority && validateStatus;
  if (bothDateAndCategoryValid && bothStatusAndPriorityValid) {
    const createNewTodoQuery = `
        INSERT INTO todo (id, todo, priority, status, category, due_date)
        VALUES (
            ${id},
            '${todo}',
            '${priority}',
            '${status}',
            '${category}',
            '${dueDate}'
        );`;
    await db.run(createNewTodoQuery);
    response.send("Todo Successfully Added");
  } else {
    if (!validateDate) {
      response.status(400).send("Invalid Due Date");
    }
    if (!validateCategory) {
      response.status(400).send("Invalid Todo Category");
    }
    if (!validateStatus) {
      response.status(400).send("Invalid Todo Status");
    }
    if (!validatePriority) {
      response.status(400).send("Invalid Todo Priority");
    }
  }
});

//API 5
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, category, todo, dueDate } = request.body;

  switch (true) {
    case hasStatusInQuery(request.body):
      if (statusList.find((eachValue) => eachValue === request.body.status)) {
        const updateTodoWithStatusQuery = `
        UPDATE todo
        SET status = '${status}'
        WHERE id = ${todoId};`;
        await db.run(updateTodoWithStatusQuery);
        response.send("Status Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case hasPriorityInQuery(request.body):
      if (
        priorityList.find((eachValue) => eachValue === request.body.priority)
      ) {
        const updateTodoWithPriorityQuery = `
        UPDATE todo
        SET priority = '${priority}'
        WHERE id = ${todoId};`;
        await db.run(updateTodoWithPriorityQuery);
        response.send("Priority Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case request.body.todo !== undefined:
      const updateTodoWithTodoQuery = `
        UPDATE todo
        SET todo = '${todo}'
        WHERE id = ${todoId};`;
      await db.run(updateTodoWithTodoQuery);
      response.send("Todo Updated");
      break;
    case hasCategoryInQuery(request.body):
      if (
        categoryList.find((eachValue) => eachValue === request.body.category)
      ) {
        const updateTodoWithCategoryQuery = `
        UPDATE todo
        SET category = '${category}'
        WHERE id = ${todoId};`;
        await db.run(updateTodoWithCategoryQuery);
        response.send("Category Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    default:
      if (isValid(new Date(request.body.dueDate))) {
        const formatedDate = format(
          new Date(request.body.dueDate),
          "yyyy-MM-dd"
        );
        const updateTodoDuedateQuery = `
                UPDATE todo
                SET due_date = '${formatedDate}'
                WHERE id = ${todoId};`;
        await db.run(updateTodoDuedateQuery);
        response.send("Due Date Updated");
      } else {
        response.status(400).send("Invalid Due Date");
      }
  }
});

//API 6

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
    DELETE FROM todo WHERE id = ${todoId};`;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
