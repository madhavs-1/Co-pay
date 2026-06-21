import { useState, useEffect } from 'react';

export default function RequestsModal({ activeGroupId, apiBase, adminId, onClose, onResolved }) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`${apiBase}/pool/${activeGroupId}/requests`)
            .then(res => res.json())
            .then(data => {
                setRequests(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [apiBase, activeGroupId]);

    const handleResolve = async (reqId, action) => {
        try {
            const res = await fetch(`${apiBase}/pool/request/resolve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ request_id: reqId, action, admin_id: adminId })
            });
            const data = await res.json();
            if (data.success) {
                setRequests(prev => prev.filter(r => r.id !== reqId));
                if (action === 'approve') onResolved(); // trigger a re-fetch or toast
            } else {
                alert(data.error || "Failed to resolve request.");
            }
        } catch (err) {
            alert("Network error.");
        }
    };

    return (
        <div className="numpad-overlay" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="numpad-header">
                <span className="material-symbols-rounded close-btn" onClick={onClose}>close</span>
                <span className="numpad-title">Pending Requests</span>
                <span style={{width: '24px'}}></span>
            </div>
            <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
                ) : requests.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>No pending requests.</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {requests.map(req => {
                            const dateStr = new Date(req.timestamp).toLocaleDateString();
                            return (
                                <div key={req.id} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '16px', backgroundColor: 'var(--surface-color)', 
                                    borderRadius: '12px', border: '1px solid var(--accent-dark)'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{req.user_name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Requested on {dateStr}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="pill-btn" style={{ padding: '6px 12px', borderColor: 'var(--danger-color)', color: 'var(--danger-color)' }} onClick={() => handleResolve(req.id, 'reject')}>Reject</button>
                                        <button className="pill-btn" style={{ padding: '6px 12px', borderColor: 'var(--success-color)', color: 'var(--success-color)' }} onClick={() => handleResolve(req.id, 'approve')}>Approve</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
