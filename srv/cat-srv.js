const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const crypto = require('crypto');
const { v4: uuidv4 } = require("uuid");
let logID;
let loggg;
module.exports = async (srv) => {
  const db = await cds.connect.to({
    kind: "postgres",
    credentials: {
      host: "localhost",
      port: 5432,
      user: "postgres",
      password: "ramchandra@1999",
      database: "postgres",
      schemas: "public",
    },
  });
  srv.on("CREATE", "BuyerRegister", async (req) => {
    try {
      const { username, email, password } = req.data;
      const id = uuidv4();
      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await db.run(
        INSERT.into("bookshop_buyers")
          .columns("id", "username", "email", "password")
          .values(id, username, email, hashedPassword)
      );

      return result;
    } catch (err) {
      console.error("Error registering user:", err);
      throw err;
    }
  });
  srv.on("CREATE", "SellerRegister", async (req) => {
    try {
      const { username, email, password } = req.data;
      const id = uuidv4();
      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await db.run(
        INSERT.into("bookshop_sellers")
          .columns("id", "username", "email", "password")
          .values(id, username, email, hashedPassword)
      );

      return result;
    } catch (err) {
      console.error("Error registering user:", err);
      throw err;
    }
  });

  srv.on("CREATE", "BuyerLogin", async (req) => {
    try {
      const { email: email, password: password } = req.data;

      const user = await db.run(
        SELECT.from("bookshop_buyers").where({ email: email })
      );

      if (!user || !user[0]) {
        return req.reply({ error: "User not found" }).code(404);
      }
      logID = user[0].id;

      const hashedPasswordFromDB = user[0].password;
      const match = await bcrypt.compare(password, hashedPasswordFromDB);

      if (match) {
        const token = generateToken(user.id);
        console.log(token);
        return req.reply({ token });
      } else {
        return req.reply({ error: "Incorrect password" }).code(401);
      }
    } catch (err) {
      console.error("Error logging in:", err);
      return req.reply({ error: "Internal server error" }).code(500);
    }
  });

  srv.on("CREATE", "SellerLogin", async (req) => {
    try {
      const { email: email, password: password } = req.data;

      const user = await db.run(
        SELECT.from("bookshop_sellers").where({ email: email })
      );

      if (!user || !user[0]) {
        return req.reply({ error: "User not found" }).code(404);
      }
      logID = user[0].id;

      const hashedPasswordFromDB = user[0].password;
      const match = await bcrypt.compare(password, hashedPasswordFromDB);

      if (match) {
        const token = generateToken(user.id);
        console.log(token);
        return req.reply({ token });
      } else {
        return req.reply({ error: "Incorrect password" }).code(401);
      }
    } catch (err) {
      console.error("Error logging in:", err);
      return req.reply({ error: "Internal server error" }).code(500);
    }
  });
  const generateToken = (logID) => {
    const secretKey = "dcjdncewakjxedhedjnejdxnjwedie";
    const token = jwt.sign({ logID }, secretKey, { expiresIn: "1h" });
    return token;
  };
  srv.on("READ", "BuyerToken", async (req) => {
    try {
      const users = await db.run(SELECT.from("bookshop_buyers"));

      let token;

      users.forEach((user) => {
        console.log(user);
        if (user.id === logID) {
          console.log("UserID:", logID);
          token = generateToken(logID);
        }
      });
      console.log(token);
      return { token, users };
    } catch (err) {
      console.error("Error fetching users:", err);
      return req.error({ error: "Internal server error" }).code(500);
    }
  });
  srv.on("READ", "SellerToken", async (req) => {
    try {
      const users = await db.run(SELECT.from("bookshop_sellers"));

      let token;

      users.forEach((user) => {
        console.log(user);
        if (user.id === logID) {
          console.log("UserID:", logID);
          token = generateToken(logID);
        }
      });
      console.log(token);
      return { token, users };
    } catch (err) {
      console.error("Error fetching users:", err);
      return req.error({ error: "Internal server error" }).code(500);
    }
  });
  srv.on("READ", "getbooks", async () => {
    try {
      const result = await db.run(SELECT.from("bookshop_books"));
      // console.log("backenddata", result);
      return result;
    } catch (error) {
      console.error("Error fetching states", error);
      throw error;
    }
  });

  srv.on("CREATE", "postbooks", async (req) => {
    try {
      const {
        id: id,
        imageurl: imageURL,
        bookname: bookname,
        price: price,
        quantity: quantity,
        seller_id: seller_id,
      } = req.data;
      const query = `INSERT INTO bookshop_books
        (id,imageurl,bookname,price,quantity,seller_id)
        VALUES($1, $2, $3, $4, $5,$6)
        RETURNING *`;

      const values = [id, imageURL, bookname, price, quantity, seller_id];
      const result = await db.run(query, values);
      return result;
    } catch (error) {
      console.error("Error creating country", error);
      throw error;
    }
  });
  srv.on("READ", "sellers", async () => {
    try {
      const result = await db.run(SELECT.from("bookshop_sellers"));
      return result;
    } catch (error) {
      console.error("Error fetching states", error);
      throw error;
    }
  });

  srv.on("READ", "buyers", async () => {
    try {
      const result = await db.run(SELECT.from("bookshop_buyers"));
      return result;
    } catch (error) {
      console.error("Error fetching states", error);
      throw error;
    }
  });

  //-------------------cart added item ------------------------------

  srv.on("CREATE", "addtocart", async (req) => {
    try {
      const {
        id: id,
        imageurl: imageURL,
        bookname: bookname,
        price: price,
        quantity: quantity,
        book_id: book_id,
        buyer_id: buyer_id,
      } = req.data;
      const query = `INSERT INTO bookshop_cart
        (id,imageurl,bookname,price,quantity,book_id,buyer_id)
        VALUES($1, $2, $3, $4, $5,$6,$7)
        RETURNING *`;

      const values = [
        id,
        imageURL,
        bookname,
        price,
        quantity,
        book_id,
        buyer_id,
      ];
      const result = await db.run(query, values);
      return result;
    } catch (error) {
      console.error("Error creating country", error);
      throw error;
    }
  });

  //-------------------get cart items------------

  srv.on("READ", "addtocart", async () => {
    try {
      const result = await db.run(
        SELECT.from("bookshop_cart").where({ buyer_id: logID })
      );
      console.log("cartItems", logID);
      return result;
    } catch (error) {
      console.error("Error fetching states", error);
      throw error;
    }
  });

  //------------------update  seller ---------------------------
  srv.on("CREATE", "proceed", async (req) => {
    try {
      // Extract data from the request
      const { id, quantity } = req.data;
      // Perform the update operation on the seller's inventory
      const result = await db.run(
        `UPDATE bookshop_books SET quantity = quantity - ? WHERE id = ?`,
        [quantity, id]
      );

      return result;
    } catch (error) {
      console.error("Error updating inventory:", error);
      throw error;
    }
  });
  srv.on("DELETE", "deletecart", async (req) => {
    const comingFromFrontendId = req.params[0].id;
    console.log(comingFromFrontendId, "reqiddelete");
    try {
      const dlt = await db.run(
        `DELETE FROM bookshop_cart WHERE id = $1`, // Use $1 as a placeholder for the parameter
        [comingFromFrontendId] // Pass the parameter value as an array
      );
      return dlt;
    } catch (error) {
      console.log("Unable to clear cart items:", error);
    }
  });
};
