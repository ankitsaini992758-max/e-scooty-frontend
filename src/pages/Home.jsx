import { useState, useEffect } from 'react';
import Form from '../components/Form';
import History from '../components/History';
import Profit from '../components/Profit';
import brandLogo from '../logo-e-scooty.png';
import '../styles/Home.css';

const Home = () => {
  const [activeTab, setActiveTab] = useState('entries');
  const [notification, setNotification] = useState(null);
  const [entries, setEntries] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleFormSuccess = (message) => {
    setNotification({ type: 'success', message });
    setRefreshKey((prev) => prev + 1);
  };

  const handleFormError = (message) => {
    setNotification({ type: 'error', message });
  };

  return (
    <div className="home-container">
      {/* Header */}
      <header className="app-header">
        <div className="brand-wrap">
          <img src={brandLogo} alt="Chandravanshi e-Scooty logo" className="brand-logo" />
          <div className="brand-text">
            <h1>Chandravanshi e-Scooty</h1>
            <p>Sales & Profit Tracker</p>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="nav-tabs">
        <button
          className={`nav-btn ${activeTab === 'entries' ? 'active' : ''}`}
          onClick={() => setActiveTab('entries')}
        >
          📝 Entries
        </button>
        <button
          className={`nav-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📋 History
        </button>
        <button
          className={`nav-btn ${activeTab === 'profit' ? 'active' : ''}`}
          onClick={() => setActiveTab('profit')}
        >
          💰 Profit
        </button>
      </nav>

      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button
            className="close-btn"
            onClick={() => setNotification(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Content */}
      <main className="main-content">
        {activeTab === 'entries' && (
          <Form
            key={refreshKey}
            onSuccess={handleFormSuccess}
            onError={handleFormError}
          />
        )}
        {activeTab === 'history' && <History key={refreshKey} />}
        {activeTab === 'profit' && <Profit key={refreshKey} />}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>&copy; 2024 Chandravanshi e-Scooty. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
