import { useState } from 'react';

export default function BalanceSection({ title = "Wallet", balance = 0, onAddFunds, onViewHistory }) {
    const [isObscured, setIsObscured] = useState(true);
    const formattedBalance = Number(balance || 0).toFixed(2);

    return (
        <>
            <div className="balance-section" onClick={onViewHistory} style={{ cursor: onViewHistory ? 'pointer' : 'default' }}>
                <section className="balance-card">

                    <div className="balance-amount">
                        <span className="currency">₹</span>
                        <span>{isObscured ? '***' : formattedBalance}</span>
                        <span 
                            className="material-symbols-rounded visibility-icon" 
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsObscured(!isObscured);
                            }}
                        >
                            {isObscured ? 'visibility' : 'visibility_off'}
                        </span>
                    </div>
                </section>
            </div>
        </>
    );
}
