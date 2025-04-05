// server.js
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Replace with your actual client ID and client secret
const CLIENT_ID = "Ov23lihXQ3idnYJhjeCU";
const CLIENT_SECRET = "ff2300d1129e75a0614ed96700aab897fbbff534";

app.use(cors());

app.get("/auth/github", (req, res) => {
  const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}`;
  res.redirect(redirectUrl);
});

app.get("/auth/github/callback", async (req, res) => {
  const code = req.query.code;

  try {
    const tokenResponse = await axios.post(
      `https://github.com/login/oauth/access_token`,
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
      },
      {
        headers: { Accept: "application/json" },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Optional: Fetch GitHub user profile
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Redirect back to frontend with user info (for simplicity)
    res.redirect(
      `http://localhost:3000?login=${encodeURIComponent(
        JSON.stringify(userResponse.data)
      )}`
    );
  } catch (error) {
    console.error("Error during GitHub OAuth", error);
    res.status(500).send("Authentication failed");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
