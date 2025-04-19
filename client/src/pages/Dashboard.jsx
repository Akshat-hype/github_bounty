// src/Dashboard.jsx
import { useNavigate } from "react-router-dom";
import BountyFetch from "../BountyFetch";

function Dashboard({ githubUsername, walletAddress }) {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h1>Welcome to Bounty Dashboard 👋</h1>
      <p><strong>GitHub:</strong> {githubUsername}</p>
      <p><strong>Wallet:</strong> {walletAddress}</p>

      <div style={styles.buttonContainer}>
        <button style={styles.button} onClick={() => navigate('/create-bounty')}>
          🛠️ Create Bounty
        </button>
        <button style={styles.button} onClick={() => navigate('/claim-bounty')}>
          🎯 Claim Bounty
        </button>
      </div>
      <BountyFetch/>
    </div>
  );
}

const styles = {
  container: {
    textAlign: 'center',
    marginTop: '50px',
    marginLeft: '330px'
  },
  buttonContainer: {
    marginTop: '30px',
    display: 'flex',
    justifyContent: 'center',
    gap: '20px'
  },
  button: {
    padding: '10px 20px',
    fontSize: '18px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#4CAF50',
    color: 'white',
    cursor: 'pointer'
  }
};

export default Dashboard;
