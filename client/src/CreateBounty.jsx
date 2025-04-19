import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

function CreateBounty() {
  const [repoLink, setRepoLink] = useState('');
  const [bountyAmount, setBountyAmount] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    // Generate unique issue ID (e.g., issue-168374879837)
    const generatedIssueId = `issue-${Date.now()}`;

    const bountyData = {
      repoLink,
      issueId: generatedIssueId,
      bountyAmount,
      timestamp: new Date(),
    };

    try {
      const userDocRef = doc(db, 'users', user.displayName);
      const bountyDocRef = doc(userDocRef, 'bounties', generatedIssueId);

      await setDoc(bountyDocRef, bountyData);

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
