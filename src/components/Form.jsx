import { useState } from 'react';
import { entryService } from '../services/api';
import '../styles/Form.css';

const Form = ({ onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    vehicleName: '',
    actualPrice: '',
    sellingPrice: '',
  });
  const [profit, setProfit] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-calculate profit
    if (name === 'actualPrice' || name === 'sellingPrice') {
      const actualPrice = name === 'actualPrice' ? parseFloat(value) : parseFloat(formData.actualPrice);
      const sellingPrice = name === 'sellingPrice' ? parseFloat(value) : parseFloat(formData.sellingPrice);

      if (!isNaN(actualPrice) && !isNaN(sellingPrice)) {
        setProfit(sellingPrice - actualPrice);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await entryService.createEntry({
        vehicleName: formData.vehicleName.trim(),
        actualPrice: parseFloat(formData.actualPrice),
        sellingPrice: parseFloat(formData.sellingPrice),
      });

      if (response.data.success) {
        onSuccess('Entry created successfully!');
        setFormData({ vehicleName: '', actualPrice: '', sellingPrice: '' });
        setProfit(0);
      }
    } catch (error) {
      onError(error.response?.data?.message || 'Failed to create entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <h2>Add New Entry</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="vehicleName">Vehicle Name</label>
            <input
              type="text"
              id="vehicleName"
              name="vehicleName"
              value={formData.vehicleName}
              onChange={handleChange}
              placeholder="Enter vehicle name"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="actualPrice">Actual Price</label>
              <input
                type="number"
                id="actualPrice"
                name="actualPrice"
                value={formData.actualPrice}
                onChange={handleChange}
                placeholder="Enter actual price"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="sellingPrice">Selling Price</label>
              <input
                type="number"
                id="sellingPrice"
                name="sellingPrice"
                value={formData.sellingPrice}
                onChange={handleChange}
                placeholder="Enter selling price"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          <div className="profit-display">
            <span className={`profit-value ${profit >= 0 ? 'positive' : 'negative'}`}>
              {profit >= 0 ? `Profit: ₹${profit.toFixed(2)}` : `Loss: ₹${Math.abs(profit).toFixed(2)}`}
            </span>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Entry'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Form;
