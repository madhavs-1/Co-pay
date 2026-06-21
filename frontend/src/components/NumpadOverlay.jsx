import { useState } from 'react';

export default function NumpadOverlay({ mode, activeGroup, onClose, onConfirm }) {
    const [amount, setAmount] = useState('0');
    const [upiId, setUpiId] = useState(mode === 'pay-scan' ? 'starbucks@okicici' : '');

    const handleType = (char) => {
        if (amount === '0' && char !== '.') {
            setAmount(char);
        } else {
            if (char === '.' && amount.includes('.')) return;
            if (amount.includes('.')) {
                const parts = amount.split('.');
                if (parts[1].length >= 2) return;
            }
            if (amount.length > 8) return;
            setAmount(prev => prev + char);
        }
    };

    const handleBackspace = () => {
        if (amount.length > 1) {
            setAmount(prev => prev.slice(0, -1));
        } else {
            setAmount('0');
        }
    };

    const handleConfirm = () => {
        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) {
            return;
        }
        if ((mode === 'pay' || mode === 'pay-scan') && !upiId.trim()) {
            alert('Target UPI ID is mandatory! Please enter it or use Mock Scan.');
            return;
        }
        onConfirm(val, upiId);
    };

    const title = (mode === 'pay' || mode === 'pay-scan') ? 'Pay' : 'Add Funds';
    const groupName = activeGroup ? activeGroup.name : 'Unknown';
    const groupBalance = activeGroup ? activeGroup.balance.toFixed(2) : '0.00';

    return (
        <div className="numpad-overlay">
            <div className="numpad-header">
                <span className="material-symbols-rounded close-btn" onClick={onClose}>close</span>
                <span className="numpad-title">{title}</span>
                <span className="material-symbols-rounded more-btn">more_vert</span>
            </div>
            <div className="numpad-target">
                {(mode === 'pay' || mode === 'pay-scan') ? (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', width: '100%'}}>
                        <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                            <span className="material-symbols-rounded">qr_code_scanner</span>
                            <span className="numpad-target-name">Target UPI</span>
                        </div>
                        <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                            <input 
                                type="text" 
                                placeholder="merchant@upi" 
                                value={upiId} 
                                onChange={e => setUpiId(e.target.value)}
                                style={{
                                    padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--accent-dark)',
                                    background: 'var(--surface-color)', color: 'var(--text-primary)', outline: 'none'
                                }}
                            />
                            <button className="pill-btn" onClick={() => setUpiId('starbucks@okicici')} style={{padding: '6px 12px', fontSize: '0.75rem', minWidth: 'auto'}}>
                                Mock Scan
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <img src="https://i.pravatar.cc/150?img=68" className="avatar" style={{ width: '56px', height: '56px', border: 'none' }} alt="Avatar"/>
                        <span className="numpad-target-name">{groupName}</span>
                        <span className="numpad-target-sub">Pool balance: ₹{groupBalance}</span>
                    </>
                )}
            </div>
            <div className="numpad-amount-container">
                <span className="currency">₹</span>
                <span className="numpad-amount">{amount}</span>
            </div>
            
            <div className="payment-method-selector">
                <span className="material-symbols-rounded method-icon">account_balance</span>
                <span className="method-name">Co-pay Pool</span>
                <span className="material-symbols-rounded">arrow_drop_down</span>
            </div>

            <div className="numpad-grid">
                {['1','2','3','4','5','6','7','8','9','.','0'].map(char => (
                    <button key={char} className="num-btn" onClick={() => handleType(char)}>{char}</button>
                ))}
                <button className="num-btn action" onClick={handleBackspace}>
                    <span className="material-symbols-rounded">backspace</span>
                </button>
            </div>
            <div className="numpad-confirm-container">
                <button className="numpad-confirm" onClick={handleConfirm}>
                    <span className="material-symbols-rounded">arrow_forward</span>
                </button>
            </div>
        </div>
    );
}
