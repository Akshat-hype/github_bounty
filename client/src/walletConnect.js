// src/walletConnect.js
import Web3 from "web3";

export async function connectWallet() {
  if (typeof window.ethereum === "undefined") {
    alert("Please install MetaMask!");
    return null;
  }
  try {
    // Request account access if needed
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    // Create Web3 instance
    const web3 = new Web3(window.ethereum);

    // Get accounts
    const accounts = await web3.eth.getAccounts();

    if (accounts.length === 0) {
      alert("No wallet accounts found!");
      return null;
    }

    const address = accounts[0]; // First connected account
    return address;
  } catch (error) {
    console.error(error);
    return null;
  }
}
