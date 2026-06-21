export default function ActionsGrid({ onJoinPool, onAddFunds, onCreatePool, onHistory }) {
    return (
        <section className="actions-grid">
            <div className="action-item" onClick={onJoinPool} style={{cursor: 'pointer'}}>
                <div className="icon-box">
                    <span className="material-symbols-rounded">login</span>
                </div>
                <span className="action-label">Join Pool</span>
            </div>
            <div className="action-item" onClick={onAddFunds} style={{cursor: 'pointer'}}>
                <div className="icon-box">
                    <span className="material-symbols-rounded">add_circle</span>
                </div>
                <span className="action-label">Add Funds</span>
            </div>
            <div className="action-item" onClick={onCreatePool} style={{cursor: 'pointer'}}>
                <div className="icon-box">
                    <span className="material-symbols-rounded">group_add</span>
                </div>
                <span className="action-label">Create Pool</span>
            </div>
            <div className="action-item" onClick={onHistory} style={{cursor: 'pointer'}}>
                <div className="icon-box">
                    <span className="material-symbols-rounded">history</span>
                </div>
                <span className="action-label">History</span>
            </div>
        </section>
    );
}
