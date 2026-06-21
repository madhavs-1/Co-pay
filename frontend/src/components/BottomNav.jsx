export default function BottomNav({ currentView, onViewChange }) {
    return (
        <div className="bottom-nav">
            <div className={`nav-item ${currentView === 'home' ? 'active' : ''}`} onClick={() => onViewChange('home')}>
                <span className="material-symbols-rounded">home</span>
                <span className="nav-label">Home</span>
            </div>
            <div className={`nav-item ${currentView === 'profile' ? 'active' : ''}`} onClick={() => onViewChange('profile')}>
                <span className="material-symbols-rounded">person</span>
                <span className="nav-label">You</span>
            </div>
        </div>
    );
}
