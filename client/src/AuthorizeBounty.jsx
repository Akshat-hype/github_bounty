import Web3 from 'web3';

// src/AuthorizeBounty.jsx
import { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

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

    const handlePay = async (walletAddress, bountyAmount) => {
        try {
            if (typeof window.ethereum === 'undefined') {
                setMessage('MetaMask is not installed.');
                return;
            }

            const web3 = new Web3(window.ethereum);
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const accounts = await web3.eth.getAccounts();
            const fromAddress = accounts[0];

            const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

            if (!bountyAmount) {
                setMessage('Bounty amount is missing.');
                return;
            }

            const amountInWei = web3.utils.toWei(bountyAmount.toString(), 'ether');

            await contract.methods.payBounty(walletAddress).send({
                from: fromAddress,
                value: amountInWei,
                gas: 500000
            });

            setMessage(`✅ Successfully paid ${bountyAmount} ETH to ${walletAddress}`);
        } catch (error) {
            console.error('❌ Payment error:', error);
            setMessage('❌ Payment failed. See console for details.');
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
                            <p><strong>Bounty:</strong> {claim.bountyAmount} ETH</p>
                            <button
                                onClick={() => handlePay(claim.walletAddress, claim.bountyAmount)}
                                style={styles.payButton}
                            >
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
