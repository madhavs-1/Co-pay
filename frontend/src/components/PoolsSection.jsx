
const poolColors = ['#6750A4', '#D0BCFF', '#4A4458', '#E8DEF8'];

export default function PoolsSection({ groups, onSelect }) {
    return (
        <section className="people-section">
            <h3 className="section-title">Your Pools</h3>
            <div className="people-grid">
                {groups.map((group, index) => {
                    const initials = group.name.substring(0, 1).toUpperCase();
                    const bgColor = poolColors[index % poolColors.length];
                    const textColor = (index % 2 === 0) ? '#fff' : '#000';
                    return (
                        <div key={group.id} className="person-item" onClick={() => onSelect(group.id)}>
                            <div className="person-avatar" style={{ 
                                backgroundColor: bgColor, 
                                color: group.image_url ? 'transparent' : textColor, 
                                border: 'none',
                                backgroundImage: group.image_url ? `url(${group.image_url})` : 'none',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}>
                                {initials}
                                {index % 2 === 0 && <div className="online-dot"></div>}
                            </div>
                            <span className="person-name">{group.name.substring(0, 8)}...</span>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
