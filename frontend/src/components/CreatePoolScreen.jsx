import { useState } from 'react';

export default function CreatePoolScreen({ onBack, onCreate, apiBase, userId }) {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setLoading(true);

        try {
            const res = await fetch(`${apiBase}/pool`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, user_id: userId })
            });
            const data = await res.json();
            setLoading(false);
            if (data.success) {
                onCreate(data.group);
            } else {
                alert(data.error || "Failed to create pool");
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
                    <div className="chat-name">Create New Pool</div>
                </div>
            </header>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Create a shared pool for your next trip, dinner, or shared expense.</p>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <input 
                        type="text" 
                        placeholder="Pool Name (e.g. Goa Trip)" 
                        value={name} 
                        onChange={e => setName(e.target.value)}
                        style={{
                            padding: '16px', borderRadius: '12px', border: '1px solid var(--accent-dark)',
                            background: 'var(--surface-color)', color: 'var(--text-primary)', outline: 'none',
                            fontSize: '1rem'
                        }}
                        autoFocus
                    />
                    <button 
                        type="submit" 
                        disabled={loading || !name.trim()}
                        style={{
                            backgroundColor: 'var(--accent-btn-bg)', color: '#fff', border: 'none', 
                            padding: '16px', borderRadius: '32px', fontSize: '1rem', fontWeight: 500,
                            cursor: 'pointer', opacity: (loading || !name.trim()) ? 0.5 : 1
                        }}
                    >
                        {loading ? 'Creating...' : 'Create Pool'}
                    </button>
                </form>
            </div>
        </div>
    );
}
