import BalanceSection from './BalanceSection';

export default function ProfileScreen({ onBack, walletBalance, onAddFunds, onViewHistory, onLogout, userName, userPhone, isDarkMode, onToggleDarkMode }) {
    return (
        <div className="chat-screen" style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh' }}>
            <header className="chat-header">
                <span className="material-symbols-rounded icon-btn" onClick={onBack}>arrow_back</span>
                <div className="chat-header-info">
                    <div className="chat-name">Your Profile</div>
                </div>
            </header>
            
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
                <div style={{
                    width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'var(--accent-color)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '3rem', fontWeight: 600,
                    color: 'var(--bg-color)', marginTop: '20px'
                }}>
                    {userName ? userName[0].toUpperCase() : 'U'}
                </div>
                <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>{userName}</h2>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{userPhone}</p>
                
                <div style={{ width: '100%', marginTop: '20px', borderRadius: '16px', overflow: 'hidden' }}>
                    <BalanceSection 
                        title="Wallet" 
                        balance={walletBalance} 
                        onAddFunds={onAddFunds} 
                        onViewHistory={onViewHistory}
                    />
                </div>

                <div 
                    style={{
                        width: '100%', padding: '16px', borderRadius: '12px', backgroundColor: 'var(--surface-color)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px',
                        cursor: 'pointer', border: '1px solid var(--accent-dark)'
                    }}
                    onClick={onToggleDarkMode}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className="material-symbols-rounded" style={{ color: 'var(--text-primary)' }}>
                            {isDarkMode ? 'light_mode' : 'dark_mode'}
                        </span>
                        <span style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 500 }}>
                            Dark Mode
                        </span>
                    </div>
                    <div style={{ 
                        width: '40px', height: '24px', borderRadius: '12px', 
                        backgroundColor: isDarkMode ? 'var(--accent-color)' : 'var(--text-secondary)',
                        position: 'relative', transition: 'background-color 0.2s'
                    }}>
                        <div style={{
                            width: '20px', height: '20px', borderRadius: '10px', backgroundColor: '#fff',
                            position: 'absolute', top: '2px', left: isDarkMode ? '18px' : '2px',
                            transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }} />
                    </div>
                </div>

                <button style={{
                    width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--danger-color)',
                    backgroundColor: 'transparent', color: 'var(--danger-color)', fontSize: '1rem', fontWeight: 500,
                    cursor: 'pointer', marginTop: '20px'
                }} onClick={onLogout}>
                    Log Out
                </button>
            </div>
        </div>
    );
}
