const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const serviceAccount = require("./firebase-adminsdk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json());
const PORT = 5000;

// Register user
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userRecord = await admin.auth().createUser({ email, password, displayName: name });
    await db.collection("users").doc(userRecord.uid).set({ name, email, createdAt: new Date() });
    res.json({ message: "Registrasi berhasil" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Verifikasi token
app.post("/api/auth/verifyToken", async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    res.json({ uid: decoded.uid, email: decoded.email });
  } catch (error) {
    res.status(401).json({ message: "Token tidak valid" });
  }
});

// Produk statis
app.get("/api/products", (req, res) => {
  res.json([
    { id: 1, name: "Kaos JokoMerch", price: 100000, img: "/assets/kaos.png" },
    { id: 2, name: "Topi JokoMerch", price: 75000, img: "/assets/topi.jpg" },
    { id: 3, name: "Stiker Logo", price: 15000, img: "/assets/logo.svg" }
  ]);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
