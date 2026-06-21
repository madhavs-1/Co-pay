import { useState } from 'react';

export default function RegisterScreen({ apiBase, phone, onRegisterSuccess }) {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setLoading(true);

        try {
            const res = await fetch(`${apiBase}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, name })
            });
            const data = await res.json();
            setLoading(false);
            
            if (data.success) {
                onRegisterSuccess(data.user);
            } else {
                alert(data.error || "Registration failed");
            }
        } catch (err) {
            setLoading(false);
            alert("Network error");
        }
    };

    return (
        <div style={{ 
            backgroundColor: 'var(--bg-color)', 
            minHeight: '100vh', 
            display: 'flex', 
            flexDirection: 'column',
            fontFamily: "'Inter', sans-serif"
        }}>
            <div style={{ flex: 1, padding: '32px 24px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ textAlign: 'center', marginTop: '40px', marginBottom: '60px' }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '40px', 
                        backgroundColor: 'var(--surface-color)', margin: '0 auto 24px auto',
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        border: '2px solid var(--accent-dark)'
                    }}>
                        <span className="material-symbols-rounded" style={{ fontSize: '40px', color: 'var(--text-primary)' }}>person_add</span>
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>What's your name?</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0 }}>This is how your friends will see you</p>
                </div>

                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ 
                        display: 'flex', flexDirection: 'column', gap: '8px'
                    }}>
                        <input 
                            type="text" 
                            placeholder="Full Name" 
                            value={name} 
                            onChange={e => setName(e.target.value)}
                            style={{
                                padding: '16px', borderRadius: '16px', border: '2px solid var(--accent-dark)',
                                background: 'var(--surface-color)', color: 'var(--text-primary)', outline: 'none',
                                fontSize: '1.1rem', fontWeight: 500
                            }}
                            autoFocus
                        />
                    </div>

                    <div style={{ flex: 1 }}></div>

                    <button 
                        type="submit" 
                        disabled={loading || !name.trim()}
                        style={{
                            backgroundColor: 'var(--accent-btn-bg)', color: 'var(--text-inverse)', border: 'none', 
                            padding: '18px', borderRadius: '32px', fontSize: '1.1rem', fontWeight: 600,
                            cursor: 'pointer', opacity: (loading || !name.trim()) ? 0.5 : 1,
                            transition: 'opacity 0.2s ease', marginBottom: '24px'
                        }}
                    >
                        {loading ? 'Creating Account...' : 'Join Co-pay'}
                    </button>
                </form>
            </div>
        </div>
    );
}
