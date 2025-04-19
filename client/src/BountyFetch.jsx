// src/BountyFetch.jsx
import { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

function BountyFetch() {
  const [bounties, setBounties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBounties = async () => {
      try {
        // Get all bounties from the 'bounties' collection
        const querySnapshot = await getDocs(collection(db.user, 'bounties'));
        const bountiesList = [];
        
        querySnapshot.forEach((doc) => {
          bountiesList.push({ id: doc.id, ...doc.data() });
        });

        setBounties(bountiesList);
      } catch (error) {
        console.error('Error fetching bounties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBounties();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={styles.bountyList}>
      <h2>Available Bounties</h2>
      {bounties.length > 0 ? (
        <ul style={styles.list}>
          {bounties.map((bounty) => (
            <li key={bounty.id} style={styles.bountyItem}>
              <a href={bounty.repoLink} target="_blank" rel="noopener noreferrer">
                <button style={styles.bountyButton}>
                  🎯 View Bounty for Issue {bounty.issueId}
                </button>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p>No bounties available.</p>
      )}
    </div>
  );
}

const styles = {
  bountyList: {
    marginTop: '40px',
    padding: '20px',
    // backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  list: {
    listStyleType: 'none',
    padding: 0,
  },
  bountyItem: {
    marginBottom: '15px',
  },
  bountyButton: {
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

// src/BountyFetch.jsx
// import { useEffect, useState } from 'react';
// import { db } from './firebase';
// import { doc, getDoc } from 'firebase/firestore';

// function BountyFetch({ githubUsername }) {
//   const [bounties, setBounties] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchBounties = async () => {
//       try {
//         // Get the user's document from the 'users' collection using githubUsername
//         const userRef = doc(db, 'users', githubUsername);
//         const userSnap = await getDoc(userRef);

//         if (userSnap.exists()) {
//           const userData = userSnap.data();
//           const userBounties = userData.bounties || []; // Get bounties, or default to empty array if none found

//           // Log user data and bounties to console
//           console.log('User Data:', userData);
//           console.log('User Bounties:', userBounties);

//           // Set the fetched bounties to state
//           setBounties(userBounties);
//         } else {
//           console.log('No such user found!');
//         }
//       } catch (error) {
//         console.error('Error fetching bounties:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBounties();
//   }, [githubUsername]); // Re-fetch when githubUsername changes

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div style={styles.bountyList}>
//       <h2>Available Bounties</h2>
//       {bounties.length > 0 ? (
//         <ul style={styles.list}>
//           {bounties.map((bounty, index) => (
//             <li key={index} style={styles.bountyItem}>
//               <a href={bounty.repoLink} target="_blank" rel="noopener noreferrer">
//                 <button style={styles.bountyButton}>
//                   🎯 View Bounty for Issue {bounty.issueId}
//                 </button>
//               </a>
//             </li>
//           ))}
//         </ul>
//       ) : (
//         <p>No bounties available.</p>
//       )}
//     </div>
//   );
// }

// const styles = {
//   bountyList: {
//     marginTop: '40px',
//     padding: '20px',
//     borderRadius: '8px',
//     boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
//   },
//   list: {
//     listStyleType: 'none',
//     padding: 0,
//   },
//   bountyItem: {
//     marginBottom: '15px',
//   },
//   bountyButton: {
//     padding: '10px 20px',
//     fontSize: '16px',
//     backgroundColor: '#4CAF50',
//     color: 'white',
//     border: 'none',
//     borderRadius: '8px',
//     cursor: 'pointer',
//   },
// };

// export default BountyFetch;
