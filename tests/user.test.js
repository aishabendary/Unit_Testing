const it = require("ava").default;
const chai = require("chai");
var expect = chai.expect;
const startDB = require('../helpers/DB');
const { MongoMemoryServer } = require('mongodb-memory-server');

require('dotenv').config()
const { addUser, getAllUsers, getSingleUser, getDeleteUser } = require('../helpers/controllers');
const User = require('../models/user');
const sinon = require("sinon");
const utils = require('../helpers/utils')


it.before(async (t)=>{
    t.context.mongod = await MongoMemoryServer.create();
     process.env.MONGOURI = t.context.mongod.getUri('cloudUnitTesting');
    await startDB();
}

);

it.after(async (t)=>{
 await t.context.mongod.stop({doCleanUp: true});
})
it("create use succesfully", async (t) => {
  // setup
  const request = {
    body: {
      firstName: "Menna",
      lastName: "Hamdy",
      age: 11,
      job: "fs",
    },
  };
  const expectedResult = {
    fullName: "Menna Hamdy",
    age: 11,
    job: "fs",
  };
//   sinon.stub(utils, 'getFullName').returns('Menna Hamdy');
  sinon.stub(utils, 'getFullName').callsFake((fname, lname)=>{
    expect(fname).to.be.equal(request.body.firstName);
    expect(lname).to.be.equal(request.body.lastName);
    return 'Menna Hamdy'
  })
  const actualResult = await addUser(request);
  const result = {
    ...expectedResult,
    __v: actualResult.__v,
    _id: actualResult._id
  }
  expect(actualResult).to.be.a('object');
  expect(actualResult._doc).to.deep.equal(result);
  t.teardown(async ()=>{
    await User.deleteMany({
        fullName: request.body.fullName,
    })
  })
  t.pass();
});



it.before(async (t) => {
  t.context.mongod = await MongoMemoryServer.create();
  process.env.MONGOURI = t.context.mongod.getUri('cloudUnitTesting');
  await startDB();
});

it.after(async (t) => {
  await t.context.mongod.stop({ doCleanUp: true });
});

it("get all users successfully", async (t) => {
  const user1 = new User({ fullName: 'Aisha Galal', age: 24, job: 'DevOps Engineer' });
  await user1.save();

  const user2 = new User({ fullName: 'Menna Hamdy', age: 11, job: 'fs' });
  await user2.save();

  const request = {};
  const actualResult = await getAllUsers(request);

  expect(actualResult).to.be.an('array');
  expect(actualResult).to.have.lengthOf(2); 

  t.teardown(async () => {
      await User.deleteMany({});
  });

  t.pass();
});


it.before(async (t) => {
  t.context.mongod = await MongoMemoryServer.create();
  process.env.MONGOURI = t.context.mongod.getUri('cloudUnitTesting');
  await startDB();
});

it.after(async (t) => {
  await t.context.mongod.stop({ doCleanUp: true });
});

it("get single user successfully", async (t) => {
  const user = new User({ fullName: ' Aisha Galal', age: 24, job: 'DevOps Engineer' });
  await user.save();

  const request = {
      params: { id: user._id.toString() } 
  };

  const actualResult = await getSingleUser(request);

  expect(actualResult).to.be.an('object');
  expect(actualResult.fullName).to.equal("Aisha Galal");

  t.teardown(async () => {
      await User.deleteMany({});
  });

  t.pass();
});


it.before(async (t) => {
  t.context.mongod = await MongoMemoryServer.create();
  process.env.MONGOURI = t.context.mongod.getUri('cloudUnitTesting');
  await startDB();
});

it.after(async (t) => {
  await t.context.mongod.stop({ doCleanUp: true });
});

it("delete single user successfully", async (t) => {
  const user = new User({ fullName: 'Aisha Galal', age: 24, job: 'DevOps Engineer' });
  await user.save();

  const request = {
      params: { id: user._id.toString() } 
  };

  const actualResult = await getDeleteUser(request);

  expect(actualResult).to.be.an('object');
  expect(actualResult.deleted).to.equal(1);

  t.teardown(async () => {
      await User.deleteMany({});
  });

  t.pass();
});


