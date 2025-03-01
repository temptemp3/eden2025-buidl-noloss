import { useState } from "react";
import "./App.css";
import { WalletManager, WalletId, NetworkId } from "@txnlab/use-wallet-react";

function App() {
  const [connected, setConnected] = useState(false);

  const handleConnect = () => {
    // TODO: Implement connection logic
    setConnected(!connected);
  };

  return (
    <div className="app">
      <div className="header">
        <button className="connect-button" onClick={handleConnect}>
          {connected ? "Disconnect" : "Connect"}
          asdf
        </button>
      </div>
      <div className="content">{/* Your main content will go here */}</div>
    </div>
  );
}

export default App;
