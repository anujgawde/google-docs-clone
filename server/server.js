const express = require("express");
const cors = require("cors");
const app = express();
const port = 8080;

const Documents = require("./Documents");
const mongoose = require("mongoose");

const uri = `mongodb+srv://<username>:<password>N@cluster0.hqpob3y.mongodb.net/`;
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB", error));

app.use(cors());
app.get("/", (req, res) => {
  res.send("Hello World!");
});

const io = require("socket.io")(9001, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
io.on("connection", (socket) => {
  socket.on("get-document", async (documentId) => {
    const document = await findOrCreateDocument(documentId);
    socket.join(documentId);

    socket.emit("load-document", document.data);

    socket.on("send-changes", (delta) => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });

    socket.on("save-document", async (data) => {
      await Documents.findByIdAndUpdate(documentId, { data });
    });
  });
});

const findOrCreateDocument = async (id) => {
  if (!id) {
    return;
  }
  const document = await Documents.findById(id);

  if (document) {
    return document;
  }

  const doc = new Documents({ _id: id, data: "" });
  const result = await doc.save();
  return result;
};

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
