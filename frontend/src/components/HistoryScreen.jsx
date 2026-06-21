import { useState, useEffect } from 'react';

export default function HistoryScreen({ onBack, apiBase, userId }) {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`${apiBase}/history/${userId}`)
            .then(res => res.json())
            .then(data => {
                setTransactions(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [apiBase, userId]);

    return (
        <div className="chat-screen" style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh' }}>
            <header className="chat-header">
                <span className="material-symbols-rounded icon-btn" onClick={onBack}>arrow_back</span>
                <div className="chat-header-info">
                    <div className="chat-name">Transaction History</div>
                </div>
            </header>
            <div className="chat-feed" style={{ padding: '0 16px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '20px' }}>Loading history...</div>
                ) : transactions.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>No transactions yet.</div>
                ) : (
                    transactions.map(tx => {
                        const isDeposit = tx.type === 'DEPOSIT';
                        const dateStr = new Date(tx.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                        const timeStr = new Date(tx.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                        
                        return (
                            <div key={tx.id} style={{
                                padding: '16px', borderBottom: '1px solid var(--accent-dark)',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        backgroundColor: isDeposit ? '#EADDFF' : '#FFDAD6',
                                        color: isDeposit ? '#21005D' : '#410002',
                                        display: 'flex', justifyContent: 'center', alignItems: 'center'
                                    }}>
                                        <span className="material-symbols-rounded">{isDeposit ? 'arrow_downward' : 'arrow_upward'}</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{tx.description}</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            {dateStr} {timeStr} • {tx.group_name}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ fontWeight: 600, color: isDeposit ? '#21005D' : '#410002' }}>
                                    {isDeposit ? '+' : '-'}₹{Math.abs(tx.amount)}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
