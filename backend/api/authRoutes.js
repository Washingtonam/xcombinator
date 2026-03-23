router.post("/register", async (req, res) => {
  const { firstName, lastName, nin, email, password } = req.body;

  const db = readDB();

  const existingUser = db.users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: Date.now(),
    firstName,
    lastName,
    nin,
    email,
    password: hashedPassword,
    balance: 0,
  };

  db.users.push(newUser);
  writeDB(db);

  res.json({ message: "User created successfully" });
});