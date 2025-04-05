// App.js
import React from "react";

function App() {
  const handleLogin = () => {
    window.location.href = "http://localhost:5000/auth/github";
  };

  const user = new URLSearchParams(window.location.search).get("login");
  const userData = user ? JSON.parse(decodeURIComponent(user)) : null;

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      {!userData ? (
        <button
          onClick={handleLogin}
          style={{
            padding: "10px 20px",
            fontSize: "18px",
            backgroundColor: "#333",
            color: "#fff",
            borderRadius: "8px",
            cursor: "pointer",
            border: "none",
          }}
        >
          Login with GitHub
        </button>
      ) : (
        <div>
          <h1>Welcome, {userData.name || userData.login}!</h1>
          <img
            src={userData.avatar_url}
            alt="avatar"
            style={{ width: "100px", borderRadius: "50%", marginTop: "20px" }}
          />
          <p>Username: {userData.login}</p>
          <p>Bio: {userData.bio || "No bio available"}</p>
        </div>
      )}
    </div>
  );
}

export default App;
