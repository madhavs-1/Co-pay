import { useState, useEffect, useRef } from 'react';

export default function ChatScreen({ activeGroup, currentUserId, onBack, onPay, onAdd, onScanQR, onLeave, onDelete, onRequestClick, apiBase, refreshKey }) {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [imageUrl, setImageUrl] = useState(activeGroup?.image_url);
    const chatEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        setImageUrl(activeGroup?.image_url);
    }, [activeGroup]);

    useEffect(() => {
        if (!activeGroup) return;
        setLoading(true);
        fetch(`${apiBase}/transactions/${activeGroup.id}`)
            .then(res => res.json())
            .then(data => {
                setTransactions(data.reverse());
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [activeGroup, apiBase, refreshKey]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [transactions]);

    if (!activeGroup) return null;

    const initials = activeGroup.name.substring(0, 1).toUpperCase();

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result;
            try {
                const res = await fetch(`${apiBase}/pool/${activeGroup.id}/image`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image_url: base64String })
                });
                if(res.ok) {
                    activeGroup.image_url = base64String;
                    setImageUrl(base64String);
                }
            } catch(e) {
                console.error(e);
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="chat-screen">
            <header className="chat-header">
                <span className="material-symbols-rounded icon-btn" onClick={onBack}>arrow_back</span>
                <div className="chat-header-info">
                    <div 
                        className="chat-avatar" 
                        style={{
                            backgroundColor: 'var(--accent-btn-bg)',
                            border: 'none',
                            cursor: activeGroup.admin_id === currentUserId ? 'pointer' : 'default',
                            backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            color: imageUrl ? 'transparent' : 'var(--text-inverse)'
                        }}
                        onClick={() => {
                            if(activeGroup.admin_id === currentUserId) fileInputRef.current?.click();
                        }}
                    >
                        {imageUrl ? '' : initials}
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        style={{display: 'none'}} 
                        accept="image/*"
                        onChange={handleImageUpload} 
                    />
                    <div className="chat-name-details">
                        <div className="chat-name">{activeGroup.name}</div>
                        <div className="chat-sub">Code: {activeGroup.join_code} • Balance: ₹{activeGroup.balance.toFixed(2)}</div>
                    </div>
                </div>
                <div className="chat-header-actions" style={{display: 'flex', gap: '6px', alignItems: 'center'}}>
                    {activeGroup.admin_id === currentUserId && (
                        <button className="btn-requests" onClick={onRequestClick}>Requests</button>
                    )}
                    <button className="btn-leave" onClick={onLeave}>Leave</button>
                    <button className="btn-delete" onClick={onDelete}>Delete</button>
                </div>
            </header>

            <div className="chat-feed">
                <div className="chat-date-separator">
                    <span>Recent Transactions</span>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '20px' }}>Loading...</div>
                ) : transactions.map(tx => {
                    const isDeposit = tx.type === 'DEPOSIT';
                    const dateStr = new Date(tx.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                    const timeStr = new Date(tx.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                    
                    return (
                        <div key={tx.id} className={`chat-bubble-container ${isDeposit ? 'received' : 'sent'}`}>
                            <div className="chat-bubble">
                                <div className="bubble-title">
                                    {isDeposit ? `Added to pool` : `Payment to ${activeGroup.name}`}
                                </div>
                                <div className="bubble-amount">
                                    ₹{Math.abs(tx.amount)}
                                </div>
                                <div className="bubble-status">
                                    <span className="material-symbols-rounded check-icon">check_circle</span>
                                    <span>{isDeposit ? 'Added' : 'Paid'} • {dateStr}</span>
                                    <span className="material-symbols-rounded chevron">chevron_right</span>
                                </div>
                            </div>
                            <div className="bubble-time">{timeStr}</div>
                        </div>
                    );
                })}
                <div ref={chatEndRef} style={{height:'80px'}} />
            </div>

            <div className="chat-footer">
                <button className="chat-pay-btn" style={{flex: 1}} onClick={onAdd}>Add Funds</button>
                <button className="chat-pay-btn" style={{flex: 1}} onClick={onPay}>Pay</button>
                <button className="chat-pay-btn icon-only" style={{padding: '16px', flex: 'none', display: 'flex', alignItems: 'center'}} onClick={onScanQR}>
                    <span className="material-symbols-rounded">qr_code_scanner</span>
                </button>
            </div>
        </div>
    );
}
