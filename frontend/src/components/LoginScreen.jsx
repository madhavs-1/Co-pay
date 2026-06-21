import { useState } from 'react';

export default function LoginScreen({ apiBase, onLoginSuccess }) {
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    const handleContinue = async (e) => {
        e.preventDefault();
        if (phone.length < 10) return;
        setLoading(true);

        try {
            const res = await fetch(`${apiBase}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            });
            const data = await res.json();
            setLoading(false);
            
            if (data.success) {
                onLoginSuccess(data); // Will handle both registered and unregistered
            } else {
                alert(data.error || "Login failed");
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
                        width: '80px', height: '80px', borderRadius: '24px', 
                        backgroundColor: 'var(--accent-btn-bg)', margin: '0 auto 24px auto',
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        boxShadow: '0 8px 24px rgba(168, 199, 250, 0.2)'
                    }}>
                        <span className="material-symbols-rounded" style={{ fontSize: '40px', color: '#000' }}>payments</span>
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>Welcome to Co-pay</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0 }}>Enter your phone number to get started</p>
                </div>

                <form onSubmit={handleContinue} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ 
                        display: 'flex', alignItems: 'center', 
                        border: '2px solid var(--accent-dark)', borderRadius: '16px',
                        padding: '8px 16px', backgroundColor: 'var(--surface-color)',
                        transition: 'border-color 0.2s ease'
                    }}>
                        <span style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 500, marginRight: '12px' }}>+91</span>
                        <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--accent-dark)', marginRight: '12px' }}></div>
                        <input 
                            type="tel" 
                            placeholder="00000 00000" 
                            value={phone} 
                            onChange={e => setPhone(e.target.value.replace(/[^0-9\s]/g, ''))}
                            style={{
                                flex: 1, border: 'none', background: 'transparent',
                                color: 'var(--text-primary)', outline: 'none',
                                fontSize: '1.2rem', fontWeight: 500, padding: '8px 0'
                            }}
                            autoFocus
                        />
                    </div>

                    <div style={{ flex: 1 }}></div>

                    <button 
                        type="submit" 
                        disabled={loading || phone.replace(/\s/g, '').length < 10}
                        style={{
                            backgroundColor: 'var(--accent-btn-bg)', color: 'var(--text-inverse)', border: 'none', 
                            padding: '18px', borderRadius: '32px', fontSize: '1.1rem', fontWeight: 600,
                            cursor: 'pointer', opacity: (loading || phone.replace(/\s/g, '').length < 10) ? 0.5 : 1,
                            transition: 'opacity 0.2s ease', marginBottom: '24px'
                        }}
                    >
                        {loading ? 'Verifying...' : 'Continue'}
                    </button>
                </form>
            </div>
        </div>
    );
}
