"use strict";

// in-memory db modeled as object with stock code keys, and sets of hashed IP values for IPs that liked the stock
const db = {};

// helper
const fetchInfo = async (stock) => {
  const res = await fetch(
    `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`
  );
  return await res.json();
};

module.exports = function (app) {
  app.route("/api/stock-prices").get(async function (req, res) {
    const { hashedIp: ip } = req;
    const { stock, like } = req.query;
    const resObjArr = [];
    const resObj = {};

    if (Array.isArray(stock)) {
      const stockInfo = await Promise.all([
        fetchInfo(stock[0]),
        fetchInfo(stock[1]),
      ]);
      stockInfo.forEach(({ latestPrice, symbol }) => {
        resObjArr.push({ price: latestPrice, stock: symbol });
        if (like === "true") {
          if (!db[symbol]) {
            db[symbol] = new Set();
          }
          db[symbol].add(ip);
        }
      });
    } else {
      const { latestPrice, symbol } = await fetchInfo(stock);
      resObj["price"] = latestPrice;
      resObj["stock"] = symbol;
      if (like === "true") {
        if (!db[symbol]) {
          db[symbol] = new Set();
        }
        db[symbol].add(ip);
      }
    }

    if (resObjArr.length > 0) {
      const likesOfFirst = db[resObjArr[0].stock]?.size ?? 0;
      const likesOfSecond = db[resObjArr[1].stock]?.size ?? 0;
      resObjArr[0]["rel_likes"] = likesOfFirst - likesOfSecond;
      resObjArr[1]["rel_likes"] = likesOfSecond - likesOfFirst;
      return res.json({ stockData: resObjArr });
    } else {
      const likes = db[resObj.stock]?.size ?? 0;
      resObj["likes"] = likes;
      return res.json({ stockData: resObj });
    }
  });
};
