import { useState, useEffect, useCallback } from 'react';
import BalanceSection from './components/BalanceSection';
import ActionsGrid from './components/ActionsGrid';
import PoolsSection from './components/PoolsSection';
import BottomNav from './components/BottomNav';
import ChatScreen from './components/ChatScreen';
import NumpadOverlay from './components/NumpadOverlay';
import CreatePoolScreen from './components/CreatePoolScreen';
import HistoryScreen from './components/HistoryScreen';
import ProfileScreen from './components/ProfileScreen';
import JoinPoolScreen from './components/JoinPoolScreen';
import RequestsModal from './components/RequestsModal';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import './index.css';

const API_BASE = '/api';

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('copay_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [registrationPhone, setRegistrationPhone] = useState('');
  const [currentView, setInternalCurrentView] = useState(() => {
    const saved = localStorage.getItem('copay_user');
    return saved ? 'home' : 'login';
  }); // login | register | home | chat | create-pool | join-pool | history | profile
  
  const [groups, setGroups] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [activeGroupId, setActiveGroupId] = useState(null);
  
  const [numpadMode, setNumpadMode] = useState(null);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', isError: false });
  const [txRefreshKey, setTxRefreshKey] = useState(0);

  const setCurrentView = useCallback((view) => {
    if (view === currentView) return;
    window.history.pushState({ view }, '', '');
    setInternalCurrentView(view);
  }, [currentView]);

  const openNumpad = useCallback((mode) => {
    window.history.pushState({ view: currentView, overlay: { type: 'numpad', mode } }, '', '');
    setNumpadMode(mode);
  }, [currentView]);

  const closeNumpad = useCallback(() => {
    if (numpadMode) {
      window.history.back();
    } else {
      setNumpadMode(null);
    }
  }, [numpadMode]);

  const openRequestsModal = useCallback(() => {
    window.history.pushState({ view: currentView, overlay: 'requests' }, '', '');
    setShowRequestsModal(true);
  }, [currentView]);

  const closeRequestsModal = useCallback(() => {
    if (showRequestsModal) {
      window.history.back();
    } else {
      setShowRequestsModal(false);
    }
  }, [showRequestsModal]);

  useEffect(() => {
    window.history.replaceState({ view: currentView }, '', '');
    const handlePopState = (event) => {
      if (event.state) {
        if (event.state.overlay && event.state.overlay.type === 'numpad') {
          setNumpadMode(event.state.overlay.mode);
        } else {
          setNumpadMode(null);
        }
        
        if (event.state.overlay === 'requests') {
          setShowRequestsModal(true);
        } else {
          setShowRequestsModal(false);
        }

        if (event.state.view) {
          setInternalCurrentView(event.state.view);
        }
      } else {
        setNumpadMode(null);
        setShowRequestsModal(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []); // Run once on mount

  const activeGroup = groups.find(g => g.id === activeGroupId);

  const showToast = (msg, isError = false) => {
    setToast({ show: true, msg, isError });
    setTimeout(() => setToast({ show: false, msg: '', isError: false }), 3000);
  };

  useEffect(() => {
    if (!currentUser) return;
    fetch(`${API_BASE}/groups?user_id=${currentUser.id}`)
      .then(res => res.json())
      .then(data => {
        setGroups(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error(err));

    fetch(`${API_BASE}/me?user_id=${currentUser.id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) setWalletBalance(data.balance);
      })
      .catch(err => console.error(err));
  }, [currentUser]);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('copay_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('copay_user');
    }
  }, [currentUser]);

  const handleTransaction = async (amount, type, upiId) => {
    if (type === 'wallet-add') {
      try {
        const res = await fetch(`${API_BASE}/wallet/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: currentUser.id, amount })
        });
        const data = await res.json();
        if (data.success) {
          setWalletBalance(data.new_balance);
          showToast(`Added ₹${amount.toFixed(2)} to wallet!`);
          setNumpadMode(null);
        } else {
          showToast(data.error || 'Failed to add funds', true);
        }
      } catch (err) {
        showToast('Network error', true);
      }
      return;
    }

    if (!activeGroupId) return;
    const isAdd = type === 'add' || type === 'pool-add';
    const endpoint = isAdd ? '/pool/add' : '/pool/pay';
    
    try {
      if (!isAdd) showToast('Authorizing payment...', false);
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          group_id: activeGroupId,
          user_id: currentUser.id,
          amount,
          description: isAdd ? 'Topped up pool' : `Paid to ${upiId || 'merchant@upi'}`,
          simulate_delay: !isAdd
        })
      });
      const data = await res.json();
      if (data.success) {
        setGroups(prev => prev.map(g => g.id === activeGroupId ? { ...g, balance: data.new_balance } : g));
        if (data.user_balance !== undefined) {
          setWalletBalance(data.user_balance);
        }
        const paidMsg = `Paid ₹${amount.toFixed(2)} successfully!`;
        if (!isAdd && data.splits?.length) {
          const splitSummary = data.splits.map(s => `${s.user_name} ₹${Number(s.amount).toFixed(2)}`).join(', ');
          showToast(`${paidMsg} Split: ${splitSummary}`);
        } else {
          showToast(isAdd ? `Added ₹${amount.toFixed(2)} to pool!` : paidMsg);
        }
        closeNumpad();
        setTxRefreshKey(k => k + 1);
      } else {
        showToast(data.error || 'Transaction failed', true);
      }
    } catch (err) {
      showToast('Network error', true);
    }
  };

  const handlePoolClick = (groupId) => {
    setActiveGroupId(groupId);
    setCurrentView('chat');
  };

  const handleLeaveGroup = async () => {
    try {
      const res = await fetch(`${API_BASE}/pool/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group_id: activeGroupId, user_id: currentUser.id })
      });
      const data = await res.json();
      if (data.success) {
        setGroups(prev => prev.filter(g => g.id !== activeGroupId));
        setCurrentView('home');
        showToast('Left the pool.');
      }
    } catch (e) { showToast('Error leaving pool', true); }
  };

  const handleDeleteGroup = async () => {
    try {
      const res = await fetch(`${API_BASE}/pool/${activeGroupId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setGroups(prev => prev.filter(g => g.id !== activeGroupId));
        setCurrentView('home');
        showToast('Pool deleted.');
      }
    } catch (e) { showToast('Error deleting pool', true); }
  };

  return (
    <div className="app-container">
      {currentView === 'login' && (
        <LoginScreen 
          apiBase={API_BASE}
          onLoginSuccess={(data) => {
            if (data.registered) {
              setCurrentUser(data.user);
              setCurrentView('home');
            } else {
              setRegistrationPhone(data.phone);
              setCurrentView('register');
            }
          }}
        />
      )}

      {currentView === 'register' && (
        <RegisterScreen
          apiBase={API_BASE}
          phone={registrationPhone}
          onRegisterSuccess={(user) => {
            setCurrentUser(user);
            setCurrentView('home');
          }}
        />
      )}

      {currentView === 'home' && currentUser && (
        <div className="home-screen">
          <BalanceSection 
            title="Wallet" 
            balance={walletBalance} 
            onAddFunds={() => setNumpadMode('wallet-add')} 
            onViewHistory={() => setCurrentView('history')} 
          />
          <ActionsGrid 
            onAddFunds={() => setNumpadMode('wallet-add')}
            onJoinPool={() => setCurrentView('join-pool')}
            onCreatePool={() => setCurrentView('create-pool')}
            onHistory={() => setCurrentView('history')}
          />
          <PoolsSection groups={groups} onSelect={handlePoolClick} />
          <BottomNav currentView={currentView} onViewChange={setCurrentView} />
        </div>
      )}

      {currentView === 'chat' && currentUser && (
        <ChatScreen 
          activeGroup={activeGroup} 
          currentUserId={currentUser.id}
          onBack={() => setCurrentView('home')} 
          onPay={() => openNumpad('pay')}
          onAdd={() => openNumpad('add')}
          onScanQR={() => openNumpad('pay-scan')}
          onRequestClick={openRequestsModal}
          onLeave={handleLeaveGroup}
          onDelete={handleDeleteGroup}
          apiBase={API_BASE}
          refreshKey={txRefreshKey}
        />
      )}

      {currentView === 'join-pool' && currentUser && (
        <JoinPoolScreen 
          onBack={() => setCurrentView('home')} 
          apiBase={API_BASE}
          userId={currentUser.id}
          onJoin={(msg) => {
            setCurrentView('home');
            showToast(msg);
          }}
        />
      )}

      {currentView === 'create-pool' && currentUser && (
        <CreatePoolScreen 
          onBack={() => setCurrentView('home')} 
          apiBase={API_BASE}
          userId={currentUser.id}
          onCreate={(newGroup) => {
            setGroups(prev => [...prev, newGroup]);
            setActiveGroupId(newGroup.id);
            setCurrentView('chat');
            showToast('Pool created successfully!');
          }}
        />
      )}

      {currentView === 'history' && currentUser && (
        <HistoryScreen 
          onBack={() => setCurrentView('home')} 
          apiBase={API_BASE}
          userId={currentUser.id}
        />
      )}

      {currentView === 'profile' && currentUser && (
        <ProfileScreen 
          onBack={() => setCurrentView('home')} 
          walletBalance={walletBalance}
          onAddFunds={() => openNumpad('wallet-add')}
          onViewHistory={() => setCurrentView('history')}
          onLogout={() => {
            setCurrentUser(null);
            setCurrentView('login');
          }}
          userName={currentUser.name}
          userPhone={currentUser.phone}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />
      )}
      
      {numpadMode && (
        <NumpadOverlay 
          mode={numpadMode} 
          activeGroup={activeGroup} 
          onClose={closeNumpad} 
          onConfirm={(amt, upi) => handleTransaction(amt, numpadMode, upi)} 
        />
      )}

      {showRequestsModal && (
        <RequestsModal 
          activeGroupId={activeGroupId}
          apiBase={API_BASE}
          adminId={currentUser.id}
          onClose={closeRequestsModal}
          onResolved={() => {
            showToast('Request approved! Refresh group to see changes.');
          }}
        />
      )}
      
      <div className={`toast ${!toast.show ? 'hidden' : ''}`} style={{ backgroundColor: toast.isError ? 'var(--danger-color)' : 'var(--surface-color)', color: 'var(--text-primary)' }}>
        <span>{toast.msg}</span>
      </div>
    </div>
  );
}

export default App;
