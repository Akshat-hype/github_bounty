// src/AuthorizeBounty.jsx
import { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { ethers } from 'ethers';

// Replace with your deployed contract details
const CONTRACT_ADDRESS = "0xBAE4A19953f795265C62EbD4112D0e09F2b3d4E5";
const CONTRACT_ABI = [
        {
            "inputs": [
                {
                    "internalType": "address payable",
                    "name": "contributor",
                    "type": "address"
                }
            ],
            "name": "payBounty",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "stateMutability": "payable",
            "type": "receive"
        },
        {
            "inputs": [],
            "name": "bountyCreator",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ];

function AuthorizeBounty() {
  const [claims, setClaims] = useState([]);
  const [issueId, setIssueId] = useState('');
  const [message, setMessage] = useState('');
  const auth = getAuth();

  const fetchClaims = async () => {
    if (!auth.currentUser || !issueId) return;

    try {
      const claimsRef = collection(
        db,
        'users',
        auth.currentUser.displayName,
        'bounties',
        issueId,
        'claims'
      );
      const snapshot = await getDocs(claimsRef);
      const claimsList = [];
      snapshot.forEach((doc) => {
        claimsList.push({ id: doc.id, ...doc.data() });
      });
      setClaims(claimsList);
    } catch (error) {
      console.error('Error fetching claims:', error);
    }
  };

  const handlePay = async (walletAddress, amountInEth) => {
    try {
      if (!window.ethereum) {
        setMessage('MetaMask is not installed.');
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.payBounty(walletAddress, {
        value: ethers.utils.parseEther(amountInEth),
      });

      await tx.wait();
      setMessage(`Successfully paid ${amountInEth} ETH to ${walletAddress}`);
    } catch (error) {
      console.error('Payment error:', error);
      setMessage('Payment failed. See console for details.');
    }
  };

  return (
    <div style={styles.container}>
      <h2>Authorize Bounty</h2>
      <input
        type="text"
        placeholder="Enter Issue ID"
        value={issueId}
        onChange={(e) => setIssueId(e.target.value)}
        style={styles.input}
      />
      <button onClick={fetchClaims} style={styles.button}>Fetch Claims</button>

      {claims.length > 0 ? (
        <ul style={styles.claimList}>
          {claims.map((claim) => (
            <li key={claim.id} style={styles.claimItem}>
              <p><strong>GitHub:</strong> {claim.githubUsername}</p>
              <p><strong>Wallet:</strong> {claim.walletAddress}</p>
              <p><strong>PR Link:</strong> <a href={claim.prLink} target="_blank" rel="noopener noreferrer">{claim.prLink}</a></p>
              <input
                type="text"
                placeholder="Enter Amount in ETH"
                onChange={(e) => claim.amount = e.target.value}
                style={styles.amountInput}
              />
              <button onClick={() => handlePay(claim.walletAddress, claim.amount)} style={styles.payButton}>
                ✅ Authorize & Pay
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No claims found.</p>
      )}
      {message && <p>{message}</p>}
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: '#111',
    borderRadius: '10px',
    color: '#fff',
  },
  input: {
    width: '100%',
    padding: '1rem',
    marginBottom: '1rem',
    fontSize: '1rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '0.75rem',
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    cursor: 'pointer',
    marginBottom: '1.5rem',
  },
  claimList: {
    listStyle: 'none',
    padding: 0,
  },
  claimItem: {
    border: '1px solid #444',
    padding: '1rem',
    marginBottom: '1rem',
    borderRadius: '8px',
  },
  amountInput: {
    width: '100%',
    padding: '0.5rem',
    marginBottom: '0.5rem',
    borderRadius: '6px',
    fontSize: '1rem',
  },
  payButton: {
    backgroundColor: '#2ecc71',
    padding: '0.6rem 1.2rem',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};

export default AuthorizeBounty;
