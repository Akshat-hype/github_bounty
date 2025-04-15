import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectWallet } from '../walletConnect';
import { githubLogin } from '../githublogin';
import { saveUserData } from '../saveUser';

const LoginPage = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [githubUsername, setGithubUsername] = useState(null);
  const navigate = useNavigate();

  const handleMetaMaskConnect = async () => {
    const address = await connectWallet();
    if (address) {
      setWalletAddress(address);
    }
  };

  const handleGithubLogin = async () => {
    const user = await githubLogin();
    if (user) {
      setGithubUsername(user.displayName || user.email); // ✅ update here
    }
  };
  if (githubUsername && walletAddress) {
    saveUserData(githubUsername, walletAddress);
  }

  // ✅ UseEffect to watch when both are connected
  useEffect(() => {
    if (walletAddress && githubUsername) {
      navigate('/dashboard');
    }
  }, [walletAddress, githubUsername, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-8">Login to Continue</h1>

      {/* GitHub Login Button */}
      <button
        onClick={handleGithubLogin}
        className="bg-black text-white px-6 py-3 rounded-xl shadow-md mb-6 hover:bg-gray-800 transition"
      >
        {githubUsername ? `GitHub: ${githubUsername}` : 'Login with GitHub'}
      </button>

      {/* MetaMask Connect Button */}
      <button
        onClick={handleMetaMaskConnect}
        className="bg-orange-500 text-white px-6 py-3 rounded-xl shadow-md hover:bg-orange-600 transition"
      >
        {walletAddress ? `Wallet: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Connect Wallet'}
      </button>
    </div>
  );
};

export default LoginPage;
