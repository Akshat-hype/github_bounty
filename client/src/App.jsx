import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import Dashboard from './pages/Dashboard';
import CreateBounty from './CreateBounty';
import Login from './pages/LoginPage'; // Assuming Login component exists

function App() {
  const [githubUsername, setGithubUsername] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRef = doc(db, "users", "exampleUsername"); // Replace with the actual GitHub username
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setGithubUsername(user.displayName);
          setWalletAddress(walletAddress);
        } else {
          console.log("No such user!");
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Show loading state while data is being fetched
  if (loading) {
    return <div>Loading...</div>;
  }

  // If user data is fetched successfully, render the routes
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard githubUsername={githubUsername} walletAddress={walletAddress} />} />
        <Route path="/create-bounty" element={<CreateBounty githubUsername={githubUsername} walletAddress={walletAddress} />} />
        {/* <Route path="/claim-bounty" element={<h1>Claim Bounty Page</h1>} /> */}
      </Routes>
    </Router>
  );
}

export default App; // Ensure default export is here
