function validateUser(req, res, next) {
  const data = req.body;

  if (data.email.length < 2 || data.email == undefined) {
    return res.status(400).json({ message: "O e-mail digitado é inválido" });
  }

  if (data.password.length < 4) {
    return res
      .status(400)
      .json({ message: "A senha precisa ter no mínimo 4 dígitos." });
  }
  return next();
}

export default validateUser;
