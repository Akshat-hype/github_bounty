// src/CreateBounty.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';  // Import Firestore instance
import { collection, doc, setDoc } from 'firebase/firestore'; // Firestore functions
import { getAuth } from 'firebase/auth';

function CreateBounty() {
  const [repoLink, setRepoLink] = useState('');
  const [issueId, setIssueId] = useState('');
  const [bountyAmount, setBountyAmount] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser); // Store user info (UID, etc.)
    } else {
      navigate('/login'); // Redirect to login if not authenticated
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    const bountyData = {
      repoLink,
      issueId,
      bountyAmount,
      timestamp: new Date(),
    };

    try {
      // Reference to user's document
      const userDocRef = doc(db, 'users', user.displayName);
      // Create a subcollection "bounties" and add bounty
      await setDoc(doc(collection(userDocRef, 'bounties')), bountyData);

      console.log('Bounty created and stored:', bountyData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating bounty:', error);
    }
  };

  return (
    <div style={styles.container}>
      <h1>Create Bounty</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label htmlFor="repoLink">GitHub Repo Link:</label>
          <input
            type="text"
            id="repoLink"
            value={repoLink}
            onChange={(e) => setRepoLink(e.target.value)}
            placeholder="https://github.com/username/repo"
            required
          />
        </div>

        <div style={styles.inputGroup}>
          <label htmlFor="issueId">Issue ID / Title:</label>
          <input
            type="text"
            id="issueId"
            value={issueId}
            onChange={(e) => setIssueId(e.target.value)}
            placeholder="Issue #1234"
            required
          />
        </div>

        <div style={styles.inputGroup}>
          <label htmlFor="bountyAmount">Bounty Amount (in Sepolia ETH):</label>
          <input
            type="number"
            id="bountyAmount"
            value={bountyAmount}
            onChange={(e) => setBountyAmount(e.target.value)}
            placeholder="0.5 ETH"
            required
          />
        </div>

        <button type="submit" style={styles.button}>Create Bounty</button>
      </form>
    </div>
  );
}

// Inline styles
const styles = {
  container: {
    padding: '2rem',
    maxWidth: '500px',
    margin: '0 auto',
    backgroundColor: 'black',
    borderRadius: '10px',
    boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputGroup: {
    marginBottom: '1rem',
  },
  button: {
    padding: '0.75rem',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
};

export default CreateBounty;
