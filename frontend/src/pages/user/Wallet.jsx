import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getWallet, addMoney, getWalletHistory } from '../../services/auth'
import toast from 'react-hot-toast'
import '../../styles/user/Wallet.css'

const Wallet = () => {
  const { user } = useAuth()
  const [wallet, setWallet] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false)
  const [amount, setAmount] = useState('')
  const [addingMoney, setAddingMoney] = useState(false)

  useEffect(() => {
    fetchWalletData()
  }, [])

  const fetchWalletData = async () => {
    setLoading(true)
    try {
      const [walletRes, historyRes] = await Promise.all([
        getWallet(),
        getWalletHistory()
      ])
      setWallet(walletRes.wallet)
      setTransactions(historyRes.transactions || [])
    } catch (error) {
      console.error('Failed to fetch wallet data:', error)
      toast.error('Failed to load wallet')
    } finally {
      setLoading(false)
    }
  }

  const handleAddMoney = async (e) => {
    e.preventDefault()
    const addAmount = parseFloat(amount)
    if (isNaN(addAmount) || addAmount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    if (addAmount < 10) {
      toast.error('Minimum amount to add is ₹10')
      return
    }

    setAddingMoney(true)
    try {
      const response = await addMoney(addAmount)
      toast.success(`₹${addAmount} added to wallet successfully!`)
      setShowAddMoneyModal(false)
      setAmount('')
      fetchWalletData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add money')
    } finally {
      setAddingMoney(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString()
  }

  const getTransactionTypeIcon = (type) => {
    return type === 'credit' ? '💰' : '💸'
  }

  const getTransactionTypeClass = (type) => {
    return type === 'credit' ? 'credit' : 'debit'
  }

  if (loading) {
    return <div className="loading">Loading wallet...</div>
  }

  return (
    <div className="wallet-container">
      <div className="container">
        <h1>My Wallet</h1>
        
        <div className="wallet-grid">
          {/* Balance Card */}
          <div className="wallet-balance-card">
            <div className="balance-header">
              <span>Available Balance</span>
              <span className="balance-currency">₹</span>
            </div>
            <div className="balance-amount">
              {wallet?.balance?.toLocaleString() || 0}
            </div>
            <button 
              className="btn-add-money"
              onClick={() => setShowAddMoneyModal(true)}
            >
              + Add Money
            </button>
          </div>

          {/* Stats Cards */}
          <div className="wallet-stats">
            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-info">
                <span>Total Earned</span>
                <strong>₹{wallet?.totalEarned?.toLocaleString() || 0}</strong>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📉</div>
              <div className="stat-info">
                <span>Total Withdrawn</span>
                <strong>₹{wallet?.totalWithdrawn?.toLocaleString() || 0}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="transaction-history">
          <h2>Transaction History</h2>
          {transactions.length === 0 ? (
            <div className="no-transactions">
              <p>No transactions yet</p>
              <p className="sub-text">Add money to your wallet to get started</p>
            </div>
          ) : (
            <div className="transactions-list">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn, index) => (
                    <tr key={index}>
                      <td>{formatDate(txn.createdAt)}</td>
                      <td>
                        <span className="txn-icon">{getTransactionTypeIcon(txn.type)}</span>
                        {txn.description || (txn.type === 'credit' ? 'Money Added' : 'Payment')}
                      </td>
                      <td className={getTransactionTypeClass(txn.type)}>
                        {txn.type === 'credit' ? '+' : '-'} ₹{txn.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Money Modal */}
      {showAddMoneyModal && (
        <div className="modal-overlay" onClick={() => setShowAddMoneyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add Money to Wallet</h2>
            <form onSubmit={handleAddMoney}>
              <div className="form-group">
                <label>Enter Amount (Minimum ₹10)</label>
                <div className="amount-input-wrapper">
                  <span className="currency-symbol">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="10"
                    step="1"
                    autoFocus
                  />
                </div>
              </div>
              <div className="quick-amounts">
                <button type="button" onClick={() => setAmount('100')}>₹100</button>
                <button type="button" onClick={() => setAmount('500')}>₹500</button>
                <button type="button" onClick={() => setAmount('1000')}>₹1000</button>
                <button type="button" onClick={() => setAmount('2000')}>₹2000</button>
              </div>
              <div className="modal-buttons">
                <button type="button" className="btn-secondary" onClick={() => setShowAddMoneyModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={addingMoney}>
                  {addingMoney ? 'Processing...' : `Add ₹${amount || '0'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Wallet