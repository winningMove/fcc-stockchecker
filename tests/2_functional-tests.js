const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const { suiteSetup, suiteTeardown } = require("mocha");

chai.use(chaiHttp);
let requester;

suite("Functional Tests", function () {
  suiteSetup(function openConnection() {
    requester = chai.request(server).keepOpen();
  });
  suiteTeardown(function closeConnection() {
    requester.close();
  });

  test("getting one stock's info succeeds", (done) => {
    requester
      .get("/api/stock-prices")
      .query({ stock: "goog", like: "false" })
      .end((err, res) => {
        const { stock, price, likes } = res.body.stockData;
        assert.equal(stock, "GOOG");
        assert.typeOf(price, "number");
        assert.strictEqual(likes, 0);
        done();
      });
  });
  test("getting one stock's info and liking it succeeds", (done) => {
    requester
      .get("/api/stock-prices")
      .query({ stock: "goog", like: "true" })
      .end((err, res) => {
        const { stock, price, likes } = res.body.stockData;
        assert.equal(stock, "GOOG");
        assert.typeOf(price, "number");
        assert.strictEqual(likes, 1);
        done();
      });
  });
  test("liking stock multiple times from same IP doesn't increase likes", (done) => {
    requester
      .get("/api/stock-prices")
      .query({ stock: "goog", like: "true" })
      .end((err, res) => {
        const { stock, price, likes } = res.body.stockData;
        assert.equal(stock, "GOOG");
        assert.typeOf(price, "number");
        assert.strictEqual(likes, 1);
        done();
      });
  });
  test("getting two stocks' info succeeds", (done) => {
    requester
      .get("/api/stock-prices")
      .query({ stock: ["goog", "msft"], like: "false" })
      .end((err, res) => {
        assert.isArray(res.body.stockData);
        const [first, second] = res.body.stockData;
        assert.equal(first.stock, "GOOG");
        assert.equal(second.stock, "MSFT");
        assert.typeOf(first.price, "number");
        assert.typeOf(second.price, "number");
        assert.strictEqual(first.rel_likes, 1);
        assert.strictEqual(second.rel_likes, -1);
        done();
      });
  });
  test("getting two stocks' info and liking both succeeds", (done) => {
    requester
      .get("/api/stock-prices")
      .query({ stock: ["goog", "msft"], like: "true" })
      .end((err, res) => {
        assert.isArray(res.body.stockData);
        const [first, second] = res.body.stockData;
        assert.equal(first.stock, "GOOG");
        assert.equal(second.stock, "MSFT");
        assert.typeOf(first.price, "number");
        assert.typeOf(second.price, "number");
        assert.strictEqual(first.rel_likes, 0);
        assert.strictEqual(second.rel_likes, 0);
        done();
      });
  });
});
