import { useState, useEffect } from 'react';
import { entryService } from '../services/api';
import '../styles/Profit.css';

const Profit = () => {
  const [profitStats, setProfitStats] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [monthEntries, setMonthEntries] = useState([]);
  const [monthLoading, setMonthLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfitStats();
  }, []);

  const fetchProfitStats = async () => {
    try {
      const response = await entryService.getProfitStats();
      if (response.data.success) {
        setProfitStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch profit stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthClick = async (monthKey) => {
    if (selectedMonth === monthKey) {
      setSelectedMonth('');
      setMonthEntries([]);
      return;
    }

    setMonthLoading(true);
    try {
      const response = await entryService.getEntriesByMonth(monthKey);
      if (response.data.success) {
        setSelectedMonth(monthKey);
        setMonthEntries(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch month entries:', error);
      setSelectedMonth(monthKey);
      setMonthEntries([]);
    } finally {
      setMonthLoading(false);
    }
  };

  if (loading) {
    return <div className="profit-container"><p>Loading...</p></div>;
  }

  if (!profitStats) {
    return <div className="profit-container"><p>No data available</p></div>;
  }

  const { overall, byMonth } = profitStats;

  return (
    <div className="profit-container">
      <h2>Profit Analysis</h2>

      <div className="overall-stats">
        <div className="stat-card">
          <h3>Total Investment</h3>
          <p className="stat-value">₹{(overall.totalInvestment || 0).toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>{overall.totalProfit >= 0 ? 'Total Profit' : 'Total Loss'}</h3>
          <p className={`stat-value ${overall.totalProfit >= 0 ? 'positive' : 'negative'}`}>
            ₹{Math.abs(overall.totalProfit).toLocaleString()}
          </p>
        </div>
        <div className="stat-card">
          <h3>Total Entries</h3>
          <p className="stat-value">{overall.totalCount}</p>
        </div>
        <div className="stat-card">
          <h3>{overall.avgProfit >= 0 ? 'Average Profit' : 'Average Loss'}</h3>
          <p className={`stat-value ${overall.avgProfit >= 0 ? 'positive' : 'negative'}`}>
            ₹{Math.abs(overall.avgProfit).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="monthly-stats">
        <h3>Monthly Profit Breakdown</h3>
        {byMonth.length === 0 ? (
          <p className="no-data">No data available</p>
        ) : (
          <div className="months-grid">
            {byMonth.map((month) => (
              <button
                key={month._id}
                type="button"
                className={`month-stat-card ${selectedMonth === month._id ? 'active' : ''}`}
                onClick={() => handleMonthClick(month._id)}
              >
                <h4>{month._id}</h4>
                <div className="stat-row">
                  <span>Total Investment:</span>
                  <p>₹{(month.totalInvestment || 0).toLocaleString()}</p>
                </div>
                <div className="stat-row">
                  <span>{month.totalProfit >= 0 ? 'Total Profit:' : 'Total Loss:'}</span>
                  <p className={`profit-value ${month.totalProfit >= 0 ? 'positive' : 'negative'}`}>
                    ₹{Math.abs(month.totalProfit).toLocaleString()}
                  </p>
                </div>
                <div className="stat-row">
                  <span>Entries:</span>
                  <p>{month.count}</p>
                </div>
                <div className="stat-row">
                  <span>{month.avgProfit >= 0 ? 'Avg Profit:' : 'Avg Loss:'}</span>
                  <p className={month.avgProfit >= 0 ? 'positive-text' : 'negative-text'}>
                    ₹{Math.abs(month.avgProfit).toFixed(2)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {selectedMonth && (
          <div className="profit-month-details">
            <h4>{selectedMonth} Entries</h4>
            {monthLoading ? (
              <p className="loading">Loading entries...</p>
            ) : monthEntries.length === 0 ? (
              <p className="no-data">No entries found for this month</p>
            ) : (
              <div className="entries-table">
                <table>
                  <thead>
                    <tr>
                      <th>Vehicle Name</th>
                      <th>Actual Price</th>
                      <th>Selling Price</th>
                      <th>Profit</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthEntries.map((entry) => (
                      <tr key={entry._id}>
                        <td>{entry.vehicleName}</td>
                        <td>₹{entry.actualPrice.toLocaleString()}</td>
                        <td>₹{entry.sellingPrice.toLocaleString()}</td>
                        <td className={`profit-value-cell ${entry.profit >= 0 ? 'positive' : 'negative'}`}>
                          {entry.profit >= 0 ? `Profit: ₹${entry.profit.toFixed(2)}` : `Loss: ₹${Math.abs(entry.profit).toFixed(2)}`}
                        </td>
                        <td>{new Date(entry.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profit;
