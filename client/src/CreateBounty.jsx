import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Web3 from 'web3';

function CreateBounty() {
  const [repoLink, setRepoLink] = useState('');
  const [bountyAmount, setBountyAmount] = useState('');
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState('');
  const navigate = useNavigate();

  const contractAddress = '0x71cCed2a69239E6c400c9194AE8C1Ed4c7612BCF'; // 👈 Replace this

  // 👇 Your contract ABI goes here
  const contractABI = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "string",
          "name": "issueId",
          "type": "string"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "creator",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "BountyCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "string",
          "name": "issueId",
          "type": "string"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "contributor",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "BountyReleased",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "issueId",
          "type": "string"
        }
      ],
      "name": "createBounty",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "issueId",
          "type": "string"
        },
        {
          "internalType": "address payable",
          "name": "contributor",
          "type": "address"
        }
      ],
      "name": "releaseBounty",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "name": "bounties",
      "outputs": [
        {
          "internalType": "address",
          "name": "creator",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "isClaimed",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "issueId",
          "type": "string"
        }
      ],
      "name": "getBounty",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
    } else {
      navigate('/login');
    }

    const connectWallet = async () => {
      if (window.ethereum) {
        try {
          const web3 = new Web3(window.ethereum);
          const accounts = await web3.eth.requestAccounts();
          setAccount(accounts[0]);
        } catch (error) {
          console.error('User denied account access');
        }
      } else {
        alert('Please install MetaMask');
      }
    };

    connectWallet();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !account) return;

    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(contractABI, contractAddress);

    const generatedIssueId = `issue-${Date.now()}`;
    const bountyInWei = web3.utils.toWei(bountyAmount.toString(), 'ether');

    try {
      const tx = await contract.methods.createBounty(generatedIssueId).send({
        from: account,
        value: bountyInWei,
      });

      console.log('Transaction success:', tx);

      const bountyData = {
        repoLink,
        issueId: generatedIssueId,
        bountyAmount,
        timestamp: new Date(),
        transactionHash: tx.transactionHash,
      };

      const userDocRef = doc(db, 'users', user.displayName);
      const bountyDocRef = doc(userDocRef, 'bounties', generatedIssueId);

      await setDoc(bountyDocRef, bountyData);

      navigate('/dashboard');
    } catch (error) {
      console.error('Transaction failed:', error);
      alert('Failed to create bounty on blockchain');
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
            placeholder="0.5"
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
