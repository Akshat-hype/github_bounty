import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CreateBounty from './CreateBounty';
import Login from './pages/LoginPage'; // Assuming Login component exists

function App() {
  // Assuming you already have githubUsername and walletAddress from login
  const githubUsername = "exampleUsername"; // replace with actual
  const walletAddress = "0x123...abc";       // replace with actual

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

export default App;  // Ensure default export is here
