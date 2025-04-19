// src/ClaimBounty.jsx
import { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

function ClaimBounty() {
  const [githubUsername, setGithubUsername] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [issueId, setIssueId] = useState('');
  const [bountyOwner, setBountyOwner] = useState('');
  const [prLink, setPrLink] = useState('');
  const [message, setMessage] = useState('');

  const auth = getAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, 'users', user.displayName);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setGithubUsername(data.githubUsername);
        setWalletAddress(data.walletAddress);
      }
    };

    fetchUserData();
  }, [auth]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!githubUsername || !walletAddress || !prLink || !issueId || !bountyOwner) {
      setMessage('Please fill in all fields.');
      return;
    }

    try {
      const claimData = {
        githubUsername,
        walletAddress,
        prLink,
        claimedAt: new Date(),
        status: 'pending',
      };

      // Save under: users > bountyOwner > bounties > issueId > claims
      const claimRef = doc(
        collection(db, 'users', bountyOwner, 'bounties', issueId, 'claims')
      );
      await setDoc(claimRef, claimData);

      setMessage('Claim submitted successfully!');
    } catch (error) {
      console.error('Error submitting claim:', error);
      setMessage('Error submitting claim. Try again.');
    }
  };

  return (
    <div style={styles.container}>
      <h2>Claim Bounty</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Issue ID"
          value={issueId}
          onChange={(e) => setIssueId(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Bounty Creator's GitHub Username"
          value={bountyOwner}
          onChange={(e) => setBountyOwner(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="url"
          placeholder="GitHub PR Link"
          value={prLink}
          onChange={(e) => setPrLink(e.target.value)}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Submit Claim</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

const styles = {
    container: {
      padding: '5rem',
      maxWidth: '1000px',      // made wider
      margin: '0 auto',
      backgroundColor: '#111',
      borderRadius: '10px',
      paddingLeft:'10px',
      marginLeft: '500px',
      color: '#fff',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    input: {
      width: '100%',           // full width
      padding: '2rem',      // increased padding
      borderRadius: '8px',
      border: '1px solid #ccc',
      fontSize: '1.1rem',
      backgroundColor: '#222',
      color: '#fff',
    },
    button: {
      width: '40%',
      alignSelf: 'center',
      padding: '1rem',
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '1.1rem',
      cursor: 'pointer',
    },
  };  

export default ClaimBounty;
