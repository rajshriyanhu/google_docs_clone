const mongoose = require("mongoose")
const Document = require('./Document')

const remoteMongoDBURL = "mongodb+srv://rajshriyanshu5:raj159@cluster0.tlu3fb5.mongodb.net/google-docs-clone"
mongoose.set("strictQuery", false);
mongoose
  .connect(remoteMongoDBURL)
  .then(() => console.log("connected to data base"))
  .catch((err) => console.log(err));

const io = require("socket.io")(3001, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  })

  const defaultValue = ""

  io.on("connection", socket => {
    socket.on("get-document", async documentId => {
      const document = await findOrCreateDocument(documentId)
      socket.join(documentId)
      socket.emit("load-document", document.data)
  
      socket.on("send-changes", delta => {
        socket.broadcast.to(documentId).emit("receive-changes", delta)
      })
  
      socket.on("save-document", async data => {
        await Document.findByIdAndUpdate(documentId, { data })
      })
    })
  })

async function findOrCreateDocument(id) {
    if (id == null) return
  
    const document = await Document.findById(id)
    if (document) return document
    return await Document.create({ _id: id, data: defaultValue })
  }