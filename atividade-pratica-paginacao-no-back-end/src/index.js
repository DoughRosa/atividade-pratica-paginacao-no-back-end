import express, { req, res } from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import validateUser from "./middlewares/validateUser";
const { v4: uuidv4 } = require("uuid");
const idAutomatic = uuidv4();
const app = express();
const port = 3333;
const admins = [];

const messages = [];

app.use(express.json());
app.use(cors());

app.listen(port, () => {
  console.log(`===>>>> Server start on PORT: ${port}`);
});

//---------------TESTAR SERVIDOR---------------------------------------

app.get("/", (req, res) => {
  return res.status(200).json({ sucess: true, msg: "START EXPRESS API" });
});

//---------------CRIAR USUÁRIO CRIPTOGRAFADO------------------------------------------

app.post("/signup/crypto", validateUser, async (req, res) => {
  const data = req.body;
  const name = data.name;
  const email = data.email;
  const password = data.password;

  const emailAlreadyExist = admins.find((admin) => admin.email === email);

  if (emailAlreadyExist) {
    return res.status(400).json({ message: "Usuário já cadastrado." });
  }

  const hashPassword = await bcrypt.hash(password, 10);

  admins.push({
    id: idAutomatic,
    name: data.name,
    email: data.email,
    password: hashPassword,
  });

  res.status(201).json({ message: "Usuário cadastrado com sucesso." });
});

//------------------LISTAR USUÁRIOS CADASTRADOS----------------------------------------

app.get("/admins", (req, res) => {
  return res.status(200).json({
    message: "Lista de usuários retornada com sucesso.",
    data: admins.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
    })),
  });
});

//-------------------LOGIN-------------------------------------------------------------

app.post("/login", async (req, res) => {
  const data = req.body;
  const email = data.email;
  const password = data.password;

  const user = admins.find((user) => user.email === email);

  if (user) {
    bcrypt.compare(password, user.password, (error, result) => {
      if (result) {
        res.status(200).json({ message: "Login realizado com sucesso!" });
      } else {
        res.status(400).json({ message: "Senha incorreta!" });
      }
    });
  } else {
    res.status(404).json({ message: "Usuário não encontrado!" });
  }
});

//----------------------CRIAR RECADO------------------------------------------------------------

app.post("/messages/:userEmail", (req, res) => {
  const userEmail = req.params.userEmail;
  const data = req.body;
  const titulo = data.titulo;
  const descricao = data.descricao;

  const messageAlreadyExist = messages.find(
    (msg) => msg.descricao === descricao
  );
  const userLog = admins.find((user) => user.email !== userEmail);

  if (userLog) {
    return res.status(400).json({ message: "Usuário não logado!" });
  }

  if (messageAlreadyExist) {
    return res.status(400).json({ message: "Recado já cadastrado." });
  }

  messages.push({
    id: idAutomatic,
    usuario: userEmail,
    titulo: data.titulo,
    descricao: data.descricao,
  });

  res.status(200).json({ message: "Recado enviado com sucesso!" });
});

//-------------------------LER RECADOS-------------------------------------------------------------

app.get("/messages", (req, res) => {
  try {
    if (messages.length === 0) {
      return res.status(400).send({ message: "A lista está vazia" });
    }
    const limit = parseInt(req.query.limit);

    const pageWiew = parseInt(req.query.pageWiew);

    const currentPage = parseInt(pageWiew);

    const pageSize = parseInt(limit);

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = currentPage * pageSize;

    const messagesPaged = messages.slice(startIndex, endIndex);

    res.status(200).json({
      paginaAtual: currentPage,
      tamanhoDaPagina: limit,
      totalMensagens: messages.length,
      totalPaginas: Math.ceil(messages.length / limit),
      recados: messagesPaged,
    });
  } catch (error) {
    res.status(500).send({ message: "Erro interno" });
  }
});

//-------------------------ATUALIZAR RECADOS-------------------------------------------------------

app.put("/messages/:messageId", (req, res) => {
  const data = req.body;

  const messageId = Number(req.params.messageId);
  const titulo = data.titulo;
  const descricao = data.descricao;

  const messageIndex = messages.findIndex(
    (message) => message.id === messageId
  );

  if (messageIndex !== -1) {
    const message = messages[messageIndex];
    message.titulo = titulo;
    message.descricao = descricao;

    res.status(200).json({ message: "Recado alterado com sucesso!" });
  } else {
    return res.status(404).json({ message: "Recado não encontrado" });
  }
});

//-----------------------DELETAR RECADOS-----------------------------------------------------------

app.delete("/messages/:messageId", (req, res) => {
  const data = req.body;
  const messageId = Number(req.params.messageId);

  const messageIndex = messages.findIndex(
    (message) => message.id === messageId
  );

  if (messageIndex !== -1) {
    const message = messages[messageIndex];
    const deletedMessage = messages.splice(messageIndex, 1);

    res
      .status(200)
      .json({ message: "Recado deletado com sucesso!", deletedMessage });
  } else {
    return res.status(404).json({ message: "Recado não encontrado" });
  }
});
