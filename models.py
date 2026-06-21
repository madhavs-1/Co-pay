from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone

db = SQLAlchemy()

# Association table for Group Members
group_members = db.Table('group_members',
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('group_id', db.Integer, db.ForeignKey('groups.id'), primary_key=True)
)

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), unique=True, nullable=True)
    balance = db.Column(db.Numeric(precision=10, scale=2), default=0.00, nullable=False)
    
    __table_args__ = (
        db.CheckConstraint('balance >= 0', name='check_user_positive_balance'),
    )
    groups = db.relationship('Group', secondary=group_members, lazy='subquery', backref=db.backref('members', lazy=True))
    
class Group(db.Model):
    __tablename__ = 'groups'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    balance = db.Column(db.Numeric(precision=10, scale=2), default=0.00, nullable=False)
    join_code = db.Column(db.String(10), unique=True, nullable=True)
    admin_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # SQL level protection against negative balances
    __table_args__ = (
        db.CheckConstraint('balance >= 0', name='check_positive_balance'),
    )

class Transaction(db.Model):
    __tablename__ = 'transactions'
    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id'), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Numeric(precision=10, scale=2), nullable=False) # positive for deposit, negative for payment
    type = db.Column(db.String(50), nullable=False) # 'DEPOSIT' or 'PAYMENT'
    description = db.Column(db.String(255))
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    group = db.relationship('Group', backref=db.backref('transactions', lazy=True))
    user = db.relationship('User')

class JoinRequest(db.Model):
    __tablename__ = 'join_requests'
    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(20), default='pending') # pending, approved, rejected
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    group = db.relationship('Group', backref=db.backref('join_requests', lazy=True))
    user = db.relationship('User')
