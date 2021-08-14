import chai from "chai";
import chaiHttp from "chai-http";
import app from "../server/index";

const should = chai.should();
const { expect, assert } = chai;

chai.use(chaiHttp);

let userAId;
let userBId;

// save new users
describe("/POST /user", () => {
  const userA = {
    username: "User A",
    email: "userA@gmail.com",
  };

  const userB = {
    username: "User B",
    email: "userB@gmail.com",
  };

  it("should return error if User email is empty", (done) => {
    chai
      .request(app)
      .post(`/user`)
      .send({
        username: "User A",
      })
      .end((err, res) => {
        expect(res).to.have.status(403);
        expect(res).to.be.a("object");
        expect(res.body.error).to.be.equal("email is required");
        done();
      });
  });

  it("should return error if User username is empty", (done) => {
    chai
      .request(app)
      .post(`/user`)
      .send({
        email: "userA@gmail.com",
      })
      .end((err, res) => {
        expect(res).to.have.status(403);
        expect(res).to.be.a("object");
        expect(res.body.error).to.be.equal("Username is required");
        done();
      });
  });

  it("should return error if User username and email is empty", (done) => {
    chai
      .request(app)
      .post(`/user`)
      .send({
        username: "",
        email: "",
      })
      .end((err, res) => {
        expect(res).to.have.status(403);
        expect(res).to.be.a("object");
        done();
      });
  });

  it("should add User A to the app", (done) => {
    chai
      .request(app)
      .post(`/user`)
      .send(userA)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res).to.be.a("object");
        userAId = res.body.data.id;
        done();
      });
  });

  it("should add User B to the app", (done) => {
    chai
      .request(app)
      .post(`/user`)
      .send(userB)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res).to.be.a("object");
        userBId = res.body.data.id;
        done();
      });
  });
});

// deposit money
describe("/POST /deposit money", () => {
  const userADeposit = {
    amount: 10,
  };

  const userBDeposit = {
    amount: 20,
  };

  it("should return error if userId params is empty", (done) => {
    chai
      .request(app)
      .post(`/user/deposit/:userId`)
      .send({})
      .end((err, res) => {
        expect(res).to.have.status(403);
        expect(res).to.be.a("object");
        done();
      });
  });

  it("should return error if amount is empty", (done) => {
    chai
      .request(app)
      .post(`/user/deposit/${userAId}`)
      .send({})
      .end((err, res) => {
        expect(res).to.have.status(403);
        expect(res).to.be.a("object");
        done();
      });
  });

  it("should return error if user with the ID does not exist", (done) => {
    chai
      .request(app)
      .post(`/user/deposit/23`)
      .send(userADeposit)
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res).to.be.a("object");
        done();
      });
  });

  it("UserA should deposit money", (done) => {
    chai
      .request(app)
      .post(`/user/deposit/${userAId}`)
      .send(userADeposit)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res).to.be.a("object");
        done();
      });
  });

  it("UserB should deposit money", (done) => {
    chai
      .request(app)
      .post(`/user/deposit/${userBId}`)
      .send(userBDeposit)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res).to.be.a("object");
        done();
      });
  });
});

// send money
describe("/POST /GET /send money /Check balance", () => {
  const userBSend = {
    amount: 15,
  };

  it("should return error if sender does not exist", (done) => {
    chai
      .request(app)
      .post(`/user/send/44/${userAId}`)
      .send(userBSend)
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res).to.be.a("object");
        expect(res.body.error).to.be.equal('Sender not found');
        done();
      });
  });

  it("should return error if receiver does not exist", (done) => {
    chai
      .request(app)
      .post(`/user/send/${userBId}/55`)
      .send(userBSend)
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res).to.be.a("object");
        expect(res.body.error).to.be.equal('Receiver not found');
        done();
      });
  });

  it("should return error if amount is empty", (done) => {
    chai
      .request(app)
      .post(`/user/send/${userBId}/${userAId}`)
      .send({})
      .end((err, res) => {
        expect(res).to.have.status(403);
        expect(res).to.be.a("object");
        expect(res.body.error).to.be.equal('Amount is required');
        done();
      });
  });

  it("should return error if user amount about to be transferred is greater than his current balance", (done) => {
    chai
      .request(app)
      .post(`/user/send/${userBId}/${userAId}`)
      .send({ amount: 2000 })
      .end((err, res) => {
        expect(res).to.have.status(403);
        expect(res).to.be.a("object");
        expect(res.body.error).to.be.equal(`You can't send an amount that is greater than your current balance`);
        done();
      });
  });

  it("User B sends $15 to User A", (done) => {
    chai
      .request(app)
      .post(`/user/send/${userBId}/${userAId}`)
      .send(userBSend)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.a("object");
        done();
      });
  });

  it("User A checks their balance and has 25 dollars", (done) => {
    chai
      .request(app)
      .get(`/user/balance/${userAId}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.a("object");
        expect(res.body.data.amount).to.be.equal(25);
        done();
      });
  });

  it("User A checks their balance should return error if userId does not exist", (done) => {
    chai
      .request(app)
      .get(`/user/balance/455`)
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res).to.be.a("object");
        expect(res.body.error).to.be.equal(`User not found`);
        done();
      });
  });

  it("User B checks their balance and has 5 dollars", (done) => {
    chai
      .request(app)
      .get(`/user/balance/${userBId}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.a("object");
        expect(res.body.data.amount).to.be.equal(5);
        done();
      });
  });
});
