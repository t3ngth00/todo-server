const chai = require("chai");
const expect = chai.expect;
chai.use(require("chai-http"));
const { query } = require('../helpers/db.js');
const app = require('../index.js');
const todoRouter = require('../routes/todo.js');

describe('Todo App Backend Tests', () => {
  before(async () => {
    // set up test database
    await query('delete from task'); // clear tasks table
    await query('insert into task (description) values ($1), ($2)', ['Test task 1', 'Test task 2']); // insert test tasks
  });

  describe('GET /', () => {
    it('should return all tasks', async () => {
      try {
        const res = await chai.request(app).get('/');
        expect(res).to.have.status(200); // ensure HTTP status code is 200
        expect(res.body).to.be.an('array'); // ensure response body is an array
        expect(res.body.length).to.equal(2); // ensure there are two tasks ('Test task 1', 'Test task 2')
        // response body has properties like id and description
        expect(res.body[0]).to.have.property('id');
        expect(res.body[0]).to.have.property('description');
      }
      catch (error) {
        // if the request fails or assertions fail, throw the error
        throw error;
      }
    });
  });

  describe('POST /new', () => {
    it('should create a new task', async () => {
      try {
        const newTask = { description: 'Test 3' }; // define the new task data 

        const res = await chai.request(app)
          .post('/new')
          .send(newTask);

        expect(res).to.have.status(200);
        expect(res.body).to.have.property('id');
        expect(res.body.id).to.be.a('number');

        // check the added task in the database
        const addedTaskId = res.body.id;
        const addedTaskFromDB = await query('select * from task where id = $1', [addedTaskId]);
        expect(addedTaskFromDB.rows).to.have.lengthOf(1); // ensure the task is added in the database
        expect(addedTaskFromDB.rows[0].description).to.equal(newTask.description); // ensure correct task description
      }
      catch (error) {
        // if the request fails or assertions fail, throw the error
        throw error;
      }
    })
  })

  describe('DELETE /delete/:id', () => {
    it('should delete a task', async () => {
      try {
        const taskId = 1; // id of task which we want to delete

        const res = await chai.request(app)
          .delete('/delete/' + taskId);

        expect(res).to.have.status(200);
        expect(res.body).to.have.property('id'); // ensure response contains the ID of the deleted task
        expect(res.body.id).to.equal(taskId); // ensure the deleted task id matches the id of task which we want to delete

        // check the task is deleted from the database
        const deletedTaskFromDB = await query('select * from task where id = $1', [taskId]);
        expect(deletedTaskFromDB.rows).to.have.lengthOf(0); // ensure the task is deleted from the database
      }
      catch (error) {
        // if the request fails or assertions fail, throw the error
        throw error;
      }
    })
  })

})