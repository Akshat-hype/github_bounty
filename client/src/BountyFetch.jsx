// src/BountyFetch.jsx
import { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

function BountyFetch() {
  const [bounties, setBounties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllBounties = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const allBounties = [];

        for (const userDoc of usersSnapshot.docs) {
          const username = userDoc.id;
          const bountiesRef = collection(db, 'users', username, 'bounties');
          const bountiesSnapshot = await getDocs(bountiesRef);

          bountiesSnapshot.forEach((bountyDoc) => {
            allBounties.push({
              id: bountyDoc.id,
              ...bountyDoc.data(),
            });
          });
        }

        setBounties(allBounties);
      } catch (error) {
        console.error('Error fetching bounties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllBounties();
  }, []);

  if (loading) {
    return <div>Loading bounties...</div>;
  }

  return (
    <div style={styles.bountyList}>
      <h2>All Open Bounties</h2>
      {bounties.length > 0 ? (
        <ul style={styles.list}>
          {bounties.map((bounty) => (
            <li key={bounty.id} style={styles.bountyItem}>
              <strong>Issue ID:</strong> {bounty.id}<br />
              <strong>Bounty:</strong> {bounty.bountyAmount} ETH<br />
              <a href={bounty.repoLink} target="_blank" rel="noopener noreferrer">
                <button style={styles.bountyButton}>
                  🔗 Go to Repo
                </button>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p>No bounties available right now.</p>
      )}
    </div>
  );
}

const styles = {
  bountyList: {
    marginTop: '40px',
    padding: '20px',
    borderRadius: '8px',
    backgroundColor: 'black',
    color: 'white',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  list: {
    listStyleType: 'none',
    padding: 0,
  },
  bountyItem: {
    marginBottom: '20px',
    padding: '15px',
    borderRadius: '10px',
    backgroundColor: '#1c1c1c',
    boxShadow: '0px 2px 8px rgba(255,255,255,0.05)',
  },
  bountyButton: {
    marginTop: '10px',
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
};

export default BountyFetch;
