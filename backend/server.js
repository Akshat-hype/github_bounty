const express = require('express');
const bodyParser = require('body-parser');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const Web3 = require('web3').default;
const cors = require('cors');
require('dotenv').config();

const serviceAccount = require('./firebaseServiceAccount.json');

// 🔥 Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount)
});
const db = getFirestore();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🌐 Web3 Setup
const web3 = new Web3(process.env.SEPOLIA_RPC_URL);
const contractABI = require('./BountyVaultABI.json');
const contractAddress = process.env.CONTRACT_ADDRESS;
const privateKey = process.env.PRIVATE_KEY;

const contract = new web3.eth.Contract(contractABI, contractAddress);
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
web3.eth.accounts.wallet.add(account);

async function logStartupInfo() {
  console.log("🔑 Backend wallet address:", account.address);
  const balance = await web3.eth.getBalance(account.address);
  console.log("💰 Backend wallet balance (ETH):", web3.utils.fromWei(balance, 'ether'));
}
logStartupInfo();

// 🚀 GitHub Webhook Listener
app.post('/webhook', async (req, res) => {
  console.log("🔥 Webhook route hit");
  const event = req.body;

  if (event.action === 'closed' && event.pull_request?.merged) {
    const prUrl = event.pull_request.html_url;

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

            if (claim.prLink === prUrl && claim.status === 'pending') {
              const wallet = claim.walletAddress;
              console.log("💸 Using bounty amount from bounty doc:", bounty.bountyAmount);

              const bountyAmount = web3.utils.toWei(bounty.bountyAmount.toString(), 'ether');

              console.log(`📦 Found matching claim for PR: ${prUrl}`);
              console.log(`🎯 Releasing bounty to: ${wallet}, for issueId: ${issueId}, amount: ${bountyAmount}`);

              // Call the smart contract
              const tx = await contract.methods.releaseBounty(issueId, wallet).send({
                from: account.address,
                gas: 500000
              });

              await claimsRef.doc(claimDoc.id).update({
                status: 'paid',
                txHash: tx.transactionHash,
                paidAt: new Date()
              });

              console.log(`✅ Paid ${bounty.bountyAmount} ETH to ${wallet} for PR ${prUrl}`);
              return res.status(200).send('Bounty paid.');
            }
          }
        }
      }

      res.status(404).send('No matching claim found.');
    } catch (error) {
      console.error('❌ Webhook processing failed:', error);
      res.status(500).send('Error processing webhook.');
    }
  } else {
    res.status(200).send('No action needed');
  }
});

// ✅ 404 Fallback Route
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).send('Not Found');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
