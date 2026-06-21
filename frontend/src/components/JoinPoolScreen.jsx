import { useState } from 'react';

export default function JoinPoolScreen({ onBack, onJoin, apiBase, userId }) {
    const [joinCode, setJoinCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!joinCode.trim()) return;
        setLoading(true);

        try {
            const res = await fetch(`${apiBase}/pool/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ join_code: joinCode.trim().toUpperCase(), user_id: userId })
            });
            const data = await res.json();
            setLoading(false);
            if (data.success) {
                onJoin(data.message);
            } else {
                alert(data.error || "Failed to send join request.");
            }
        } catch (err) {
            setLoading(false);
            alert("Network error");
        }
    };

    return (
        <div className="chat-screen" style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh' }}>
            <header className="chat-header">
                <span className="material-symbols-rounded icon-btn" onClick={onBack}>arrow_back</span>
                <div className="chat-header-info">
                    <div className="chat-name">Join a Pool</div>
                </div>
            </header>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Enter the 6-character unique code shared by the pool admin.</p>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <input 
                        type="text" 
                        placeholder="e.g. A8B4C2" 
                        value={joinCode} 
                        onChange={e => setJoinCode(e.target.value.toUpperCase())}
                        maxLength={6}
                        style={{
                            padding: '16px', borderRadius: '12px', border: '1px solid var(--accent-dark)',
                            background: 'var(--surface-color)', color: 'var(--text-primary)', outline: 'none',
                            fontSize: '1.2rem', textAlign: 'center', letterSpacing: '4px', textTransform: 'uppercase'
                        }}
                        autoFocus
                    />
                    <button 
                        type="submit" 
                        disabled={loading || joinCode.trim().length < 6}
                        style={{
                            backgroundColor: 'var(--accent-btn-bg)', color: '#fff', border: 'none', 
                            padding: '16px', borderRadius: '32px', fontSize: '1rem', fontWeight: 500,
                            cursor: 'pointer', opacity: (loading || joinCode.trim().length < 6) ? 0.5 : 1
                        }}
                    >
                        {loading ? 'Sending Request...' : 'Send Join Request'}
                    </button>
                </form>
            </div>
        </div>
    );
}
