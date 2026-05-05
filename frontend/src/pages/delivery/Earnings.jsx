    import React, { useState, useEffect } from 'react'
    import { useAuth } from '../../contexts/AuthContext'
    import { getWallet, getEarnings, withdrawEarnings } from '../../services/delivery'
    import toast from 'react-hot-toast'
    import '../../styles/delivery/Earnings.css'

    const Earnings = () => {
    const { user } = useAuth()
    const [wallet, setWallet] = useState(null)
    const [earnings, setEarnings] = useState(null)
    const [loading, setLoading] = useState(true)
    const [withdrawAmount, setWithdrawAmount] = useState('')
    const [showWithdrawModal, setShowWithdrawModal] = useState(false)
    const [period, setPeriod] = useState('weekly')

    useEffect(() => {
        fetchData()
    }, [period])

    const fetchData = async () => {
        setLoading(true)
        try {
        const [walletRes, earningsRes] = await Promise.all([
            getWallet(),
            getEarnings(period)
        ])
        setWallet(walletRes.wallet)
        setEarnings(earningsRes)
        } catch (error) {
        console.error('Failed to fetch earnings:', error)
        toast.error('Failed to load earnings data')
        } finally {
        setLoading(false)
        }
    }

    const handleWithdraw = async () => {
        const amount = parseFloat(withdrawAmount)
        if (isNaN(amount) || amount < 100) {
        toast.error('Minimum withdrawal amount is ₹100')
        return
        }
        if (amount > (wallet?.balance || 0)) {
        toast.error('Insufficient balance')
        return
        }

        try {
        await withdrawEarnings(amount)
        toast.success(`Withdrawal request of ₹${amount} submitted successfully`)
        setShowWithdrawModal(false)
        setWithdrawAmount('')
        fetchData()
        } catch (error) {
        toast.error(error.response?.data?.message || 'Withdrawal failed')
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString()
    }

    if (loading) {
        return <div className="loading">Loading earnings...</div>
    }

    return (
        <div className="delivery-earnings">
        <div className="earnings-header">
            <h1>My Earnings</h1>
            <button 
            className="btn-withdraw" 
            onClick={() => setShowWithdrawModal(true)}
            disabled={!wallet || wallet.balance < 100}
            >
            Withdraw Funds
            </button>
        </div>

        <div className="earnings-stats">
            <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
                <h3>₹{wallet?.balance?.toLocaleString() || 0}</h3>
                <p>Available Balance</p>
            </div>
            </div>
            <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
                <h3>₹{earnings?.totalEarnings?.toLocaleString() || 0}</h3>
                <p>Total Earnings</p>
            </div>
            </div>
            <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
                <h3>{earnings?.totalDeliveries || 0}</h3>
                <p>Total Deliveries</p>
            </div>
            </div>
            <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-info">
                <h3>₹{earnings?.averagePerDelivery || 0}</h3>
                <p>Avg per Delivery</p>
            </div>
            </div>
        </div>

        <div className="earnings-filters">
            <div className="filter-group">
            <label>Period</label>
            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
            </select>
            </div>
        </div>

        <div className="earnings-details">
            <div className="daily-breakdown">
            <h2>Daily Breakdown</h2>
            {earnings?.dailyBreakdown && Object.keys(earnings.dailyBreakdown).length > 0 ? (
                <table className="earnings-table">
                <thead>
                    <tr>
                    <th>Date</th>
                    <th>Earnings</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(earnings.dailyBreakdown).map(([date, amount]) => (
                    <tr key={date}>
                        <td>{formatDate(date)}</td>
                        <td>₹{amount.toLocaleString()}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            ) : (
                <div className="no-data">No earnings data for this period</div>
            )}
            </div>

            <div className="recent-deliveries">
            <h2>Recent Deliveries</h2>
            {earnings?.recentDeliveries && earnings.recentDeliveries.length > 0 ? (
                <table className="earnings-table">
                <thead>
                    <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Order Amount</th>
                    <th>Commission</th>
                    </tr>
                </thead>
                <tbody>
                    {earnings.recentDeliveries.map((delivery, index) => (
                    <tr key={index}>
                        <td>{delivery.orderId}</td>
                        <td>{formatDate(delivery.date)}</td>
                        <td>₹{delivery.amount?.toLocaleString()}</td>
                        <td className="commission">₹{delivery.commission?.toLocaleString()}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            ) : (
                <div className="no-data">No deliveries yet</div>
            )}
            </div>
        </div>

        {/* Withdraw Modal */}
        {showWithdrawModal && (
            <div className="modal-overlay" onClick={() => setShowWithdrawModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Withdraw Earnings</h2>
                <p className="modal-subtitle">Available Balance: ₹{wallet?.balance?.toLocaleString()}</p>
                
                <div className="form-group">
                <label>Withdrawal Amount (Min ₹100)</label>
                <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="100"
                    max={wallet?.balance}
                />
                </div>

                <div className="withdraw-info">
                <p>⚠️ Withdrawal requests will be processed within 2-3 business days.</p>
                <p>Amount will be credited to your registered bank account.</p>
                </div>

                <div className="modal-buttons">
                <button className="btn-secondary" onClick={() => setShowWithdrawModal(false)}>Cancel</button>
                <button 
                    className="btn-primary" 
                    onClick={handleWithdraw}
                    disabled={!withdrawAmount || parseFloat(withdrawAmount) < 100}
                >
                    Request Withdrawal
                </button>
                </div>
            </div>
            </div>
        )}
        </div>
    )
    }

    export default Earnings