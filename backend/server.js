const express = require('express');
const bodyParser = require('body-parser');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const Web3 = require('web3').default;
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const serviceAccount = require('./firebaseServiceAccount.json');

initializeApp({
  credential: cert(serviceAccount)
});
const db = getFirestore();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const web3 = new Web3(process.env.SEPOLIA_RPC_URL);
const contractABI = require('./BountyVaultABI.json');
const contractAddress = process.env.CONTRACT_ADDRESS;
const privateKey = process.env.PRIVATE_KEY;

const contract = new web3.eth.Contract(contractABI, contractAddress);
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
web3.eth.accounts.wallet.add(account);

(async () => {
  console.log("🔑 Backend wallet address:", account.address);
  const balance = await web3.eth.getBalance(account.address);
  console.log("💰 Backend wallet balance (ETH):", web3.utils.fromWei(balance, 'ether'));
})();

// ==========================
// ✅ Function to check pending claims
// ==========================
async function checkPendingClaims() {
  console.log("🔎 Checking pending claims...");
  let found = false;

  try {
    const usersSnapshot = await db.collection('users').get();
    for (const userDoc of usersSnapshot.docs) {
      const username = userDoc.id;
      const bountiesRef = db.collection('users').doc(username).collection('bounties');
      const bountiesSnapshot = await bountiesRef.get();

      for (const bountyDoc of bountiesSnapshot.docs) {
        const bounty = bountyDoc.data();
        const issueId = bountyDoc.id;

        const claimsRef = bountiesRef.doc(issueId).collection('claims');
        const claimsSnapshot = await claimsRef.get();

        for (const claimDoc of claimsSnapshot.docs) {
          const claim = claimDoc.data();

          if (claim.status === 'pending') {
            found = true;
            const wallet = claim.walletAddress;
            const bountyAmount = web3.utils.toWei(bounty.bountyAmount.toString(), 'ether');
            const prUrl = claim.prLink;

            try {
              const urlParts = prUrl.split('/');
              const owner = urlParts[3];
              const repo = urlParts[4];
              const pullNumber = urlParts[6];

              const githubApiUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/merge`;
              const githubToken = process.env.GITHUB_TOKEN;

              const response = await axios.get(githubApiUrl, {
                headers: {
                  'Authorization': `Bearer ${githubToken}`,
                  'Accept': 'application/vnd.github+json'
                }
              });

              if (response.status !== 204) {
                console.log(`⚠️ PR not merged yet for claim: ${prUrl}`);
                continue; // Skip if not merged
              }
            } catch (err) {
              if (err.response && err.response.status === 404) {
                console.log(`❌ PR not merged (404) for claim: ${prUrl}`);
                continue; // Skip if 404
              } else {
                console.error("❌ GitHub API check failed:", err.message);
                continue;
              }
            }

            try {
              const bountyOnChain = await contract.methods.getBounty(issueId).call();
              if (bountyOnChain.isClaimed) {
                console.log(`⛔ Bounty already claimed on-chain for issueId: ${issueId}`);
                await claimsRef.doc(claimDoc.id).update({ status: 'done' });
                continue;
              }
            } catch (err) {
              console.error("❌ Failed to fetch on-chain bounty:", err.message);
              continue;
            }

            try {
              await contract.methods.releaseBounty(issueId, wallet).call({ from: account.address });
            } catch (err) {
              console.error("❌ Static call failed! Smart contract will revert:", err.message);
              continue;
            }

            try {
              const tx = await contract.methods.releaseBounty(issueId, wallet).send({
                from: account.address,
                gas: 500000
              });

              await claimsRef.doc(claimDoc.id).update({
                status: 'paid',
                txHash: tx.transactionHash,
                paidAt: new Date()
              });

              console.log(`✅ Paid ${bounty.bountyAmount} ETH to ${wallet} for claim: ${prUrl}`);
            } catch (err) {
              console.error("❌ Failed to send transaction:", err.message);
            }
          }
        }
      }
    }

    if (!found) {
      console.log("✅ No pending claims found at this time.");
    }
  } catch (error) {
    console.error('❌ Error checking pending claims:', error.message);
  }
}

// ==========================
// ✅ Webhook endpoint
// ==========================
app.post('/webhook', async (req, res) => {
  console.log("🔥 Webhook triggered");
  await checkPendingClaims();
  res.status(200).send('Webhook received and processed.');
});

// ==========================
// ✅ 404 Handler
// ==========================
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).send('Not Found');
});

// ==========================
// ✅ Server Start
// ==========================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ==========================
// ✅ CRON: Check every 5 minutes
// ==========================
setInterval(() => {
  console.log("⏰ Cron Job Triggered...");
  checkPendingClaims();
}, 5 * 60 * 1000); // 5 minutes (in milliseconds)

