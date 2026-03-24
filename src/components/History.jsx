import { useState, useEffect } from 'react';
import { entryService } from '../services/api';
import '../styles/History.css';

const History = () => {
  const [months, setMonths] = useState([]);
  const [entries, setEntries] = useState([]);
  const [selectedEntryIds, setSelectedEntryIds] = useState([]);
  const [notification, setNotification] = useState(null);
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Delete',
    onConfirm: null,
  });
  const [loading, setLoading] = useState(false);
  const [expandedMonth, setExpandedMonth] = useState(null);

  useEffect(() => {
    fetchMonths();
  }, []);

  useEffect(() => {
    if (!notification) return;

    const timer = setTimeout(() => {
      setNotification(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [notification]);

  const fetchMonths = async () => {
    try {
      const response = await entryService.getAllMonths();
      if (response.data.success) {
        setMonths(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch months:', error);
    }
  };

  const handleMonthClick = async (month) => {
    if (expandedMonth === month._id) {
      setExpandedMonth(null);
      setEntries([]);
      setSelectedEntryIds([]);
      return;
    }

    setLoading(true);

    try {
      const response = await entryService.getEntriesByMonth(month._id);
      if (response.data.success) {
        setEntries(response.data.data);
        setSelectedEntryIds([]);
        setExpandedMonth(month._id);
      }
    } catch (error) {
      console.error('Failed to fetch entries:', error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const openConfirmModal = ({ title, message, confirmText, onConfirm }) => {
    setConfirmState({
      isOpen: true,
      title,
      message,
      confirmText,
      onConfirm,
    });
  };

  const closeConfirmModal = () => {
    setConfirmState({
      isOpen: false,
      title: '',
      message: '',
      confirmText: 'Delete',
      onConfirm: null,
    });
  };

  const handleConfirmAction = async () => {
    if (typeof confirmState.onConfirm === 'function') {
      await confirmState.onConfirm();
    }
    closeConfirmModal();
  };

  const escapeCsvValue = (value) => {
    if (value === null || value === undefined) return '';

    const stringValue = String(value);
    if (/[",\n]/.test(stringValue)) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  };

  const handleExportMonthCsv = (monthKey) => {
    if (expandedMonth !== monthKey || entries.length === 0) {
      setNotification({ type: 'error', message: 'Open the month with entries before exporting CSV' });
      return;
    }

    const headers = [
      'Entry ID',
      'Vehicle Name',
      'Actual Price',
      'Selling Price',
      'Result',
      'Amount',
      'Net Profit Value',
      'Month',
      'Created Date',
    ];

    const rows = entries.map((entry) => {
      const resultLabel = entry.profit >= 0 ? 'Profit' : 'Loss';
      const absoluteAmount = Math.abs(entry.profit).toFixed(2);

      return [
        entry._id,
        entry.vehicleName,
        entry.actualPrice,
        entry.sellingPrice,
        resultLabel,
        absoluteAmount,
        entry.profit.toFixed(2),
        monthKey,
        new Date(entry.createdAt).toLocaleString('en-IN'),
      ].map(escapeCsvValue).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const fileUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = `${monthKey.replace(/\s+/g, '_')}_history.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(fileUrl);

    setNotification({ type: 'success', message: `${monthKey} history exported as CSV` });
  };

  const deleteSingleEntry = async (id) => {

    try {
      await entryService.deleteEntry(id);
      setEntries(entries.filter((entry) => entry._id !== id));
      setSelectedEntryIds((prev) => prev.filter((entryId) => entryId !== id));
      fetchMonths();
      setNotification({ type: 'success', message: 'Entry deleted successfully' });
    } catch (error) {
      console.error('Failed to delete entry:', error);
      setNotification({ type: 'error', message: 'Failed to delete entry' });
    }
  };

  const handleDeleteEntry = (id) => {
    openConfirmModal({
      title: 'Delete Entry',
      message: 'Are you sure you want to delete this entry?',
      confirmText: 'Delete Entry',
      onConfirm: () => deleteSingleEntry(id),
    });
  };

  const handleToggleSelectEntry = (id) => {
    setSelectedEntryIds((prev) =>
      prev.includes(id) ? prev.filter((entryId) => entryId !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedEntryIds.length === entries.length) {
      setSelectedEntryIds([]);
      return;
    }

    setSelectedEntryIds(entries.map((entry) => entry._id));
  };

  const deleteSelectedEntries = async () => {
    if (selectedEntryIds.length === 0) return;

    try {
      await entryService.deleteMultipleEntries(selectedEntryIds);
      const remainingEntries = entries.filter((entry) => !selectedEntryIds.includes(entry._id));
      setEntries(remainingEntries);
      setSelectedEntryIds([]);
      fetchMonths();
      setNotification({ type: 'success', message: 'Selected entries deleted successfully' });
    } catch (error) {
      console.error('Failed to delete selected entries:', error);
      setNotification({ type: 'error', message: 'Failed to delete selected entries' });
    }
  };

  const handleDeleteSelectedEntries = () => {
    if (selectedEntryIds.length === 0) return;

    openConfirmModal({
      title: 'Delete Selected Entries',
      message: `Delete ${selectedEntryIds.length} selected entries? This cannot be undone.`,
      confirmText: 'Delete Selected',
      onConfirm: deleteSelectedEntries,
    });
  };

  const deleteMonthHistory = async (monthKey) => {

    try {
      await entryService.deleteEntriesByMonth(monthKey);
      setEntries([]);
      setSelectedEntryIds([]);
      setExpandedMonth(null);
      fetchMonths();
      setNotification({ type: 'success', message: `Complete history deleted for ${monthKey}` });
    } catch (error) {
      console.error('Failed to delete month history:', error);
      setNotification({ type: 'error', message: 'Failed to delete complete month history' });
    }
  };

  const handleDeleteMonth = (monthKey) => {
    openConfirmModal({
      title: 'Delete Complete Month History',
      message: `Delete all entries for ${monthKey}? This cannot be undone.`,
      confirmText: 'Delete Month',
      onConfirm: () => deleteMonthHistory(monthKey),
    });
  };

  return (
    <div className="history-container">
      <h2>History</h2>

      {notification && (
        <div className={`history-notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button
            type="button"
            className="history-notification-close"
            onClick={() => setNotification(null)}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      )}

      <div className="months-list">
        {months.length === 0 ? (
          <p className="no-data">No history available</p>
        ) : (
          months.map((month) => (
            <div key={month._id} className="month-item">
              <div
                className={`month-header ${expandedMonth === month._id ? 'active' : ''}`}
                onClick={() => handleMonthClick(month)}
              >
                <div className="month-info">
                  <h3>{month._id}</h3>
                  <span className="entry-count">{month.count} entries</span>
                </div>
                <span className={`toggle-icon ${expandedMonth === month._id ? 'open' : ''}`}>
                  ▼
                </span>
              </div>

              {expandedMonth === month._id && (
                <div className="month-details">
                  <div className="month-actions">
                    <button
                      className="export-csv-btn"
                      onClick={() => handleExportMonthCsv(month._id)}
                    >
                      Export Month CSV
                    </button>
                    <button
                      className="delete-selected-btn"
                      onClick={handleDeleteSelectedEntries}
                      disabled={selectedEntryIds.length === 0}
                    >
                      Delete Selected ({selectedEntryIds.length})
                    </button>
                    <button
                      className="delete-month-btn"
                      onClick={() => handleDeleteMonth(month._id)}
                    >
                      Delete Complete Month
                    </button>
                  </div>

                  {loading ? (
                    <p className="loading">Loading...</p>
                  ) : entries.length === 0 ? (
                    <p className="no-data">No entries found</p>
                  ) : (
                    <div className="entries-table">
                      <table>
                        <thead>
                          <tr>
                            <th>
                              <input
                                type="checkbox"
                                checked={entries.length > 0 && selectedEntryIds.length === entries.length}
                                onChange={handleToggleSelectAll}
                                aria-label="Select all entries"
                              />
                            </th>
                            <th>Vehicle Name</th>
                            <th>Actual Price</th>
                            <th>Selling Price</th>
                            <th>Profit</th>
                            <th>Date</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {entries.map((entry) => (
                            <tr key={entry._id}>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={selectedEntryIds.includes(entry._id)}
                                  onChange={() => handleToggleSelectEntry(entry._id)}
                                  aria-label={`Select ${entry.vehicleName}`}
                                />
                              </td>
                              <td>{entry.vehicleName}</td>
                              <td>₹{entry.actualPrice.toLocaleString()}</td>
                              <td>₹{entry.sellingPrice.toLocaleString()}</td>
                              <td className={`profit ${entry.profit >= 0 ? 'positive' : 'negative'}`}>
                                {entry.profit >= 0 ? `Profit: ₹${entry.profit.toFixed(2)}` : `Loss: ₹${Math.abs(entry.profit).toFixed(2)}`}
                              </td>
                              <td>{new Date(entry.createdAt).toLocaleDateString()}</td>
                              <td>
                                <button
                                  className="delete-btn"
                                  onClick={() => handleDeleteEntry(entry._id)}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {confirmState.isOpen && (
        <div className="confirm-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <div className="confirm-modal-card">
            <h3 id="confirm-title">{confirmState.title}</h3>
            <p>{confirmState.message}</p>
            <div className="confirm-modal-actions">
              <button type="button" className="confirm-cancel-btn" onClick={closeConfirmModal}>
                Cancel
              </button>
              <button type="button" className="confirm-delete-btn" onClick={handleConfirmAction}>
                {confirmState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
