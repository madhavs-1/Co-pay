import os
import time
import random
import string
import logging
import re
from datetime import datetime, timezone
from decimal import Decimal
from flask import Flask, request, jsonify
from models import db, User, Group, Transaction, JoinRequest
from sqlalchemy.exc import IntegrityError
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///copay.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def format_number(d):
    """Format Decimal to int if whole number, else float."""
    if d is None:
        return 0
    if d == d.to_integral_value():
        return int(d)
    return float(d)

def normalize_phone(phone):
    if not phone: return None
    p = re.sub(r'\s+', '', phone)
    if p.startswith('+91'):
        p = p[3:]
    elif p.startswith('0'):
        p = p[1:]
    return p

# Initialize database and mock data
with app.app_context():
    db.create_all()
    # Add mock data if empty
    if not User.query.first():
        u1 = User(name='Madhav', phone='9876543210', balance=Decimal('0.00'))
        u2 = User(name='Riya', phone='8765432109', balance=Decimal('0.00'))
        u3 = User(name='Amit', phone='7654321098', balance=Decimal('0.00'))
        db.session.add_all([u1, u2, u3])
        db.session.commit()

        # Create mock groups with join codes and admin
        g1 = Group(name='Roommates', balance=Decimal('0.00'), join_code='A8B4C2', admin_id=u1.id)
        g1.members.extend([u1, u2, u3])
        g2 = Group(name='Family Trip', balance=Decimal('0.00'), join_code='F9X7M1', admin_id=u1.id)
        g2.members.extend([u1])
        g3 = Group(name='Office Lunch', balance=Decimal('0.00'), join_code='L2P0Q8', admin_id=u2.id)
        g3.members.extend([u1, u2])
        db.session.add_all([g1, g2, g3])
        db.session.commit()
        logger.info("Created mock users and groups.")

@app.route("/api/groups", methods=["GET"])
def get_groups():
    groups = Group.query.all()
    return jsonify([{
        "id": g.id,
        "name": g.name,
        "balance": format_number(g.balance),
        "join_code": g.join_code,
        "admin_id": g.admin_id,
        "image_url": g.image_url,
        "members": [{"id": m.id, "name": m.name} for m in g.members]
    } for g in groups])

@app.route("/api/pool/<int:group_id>/image", methods=["POST"])
def update_group_image(group_id):
    group = Group.query.get(group_id)
    if not group:
        return jsonify({"error": "Pool not found"}), 404
        
    data = request.json
    image_url = data.get("image_url")
    if not image_url:
        return jsonify({"error": "No image data provided"}), 400
        
    group.image_url = image_url
    db.session.commit()
    return jsonify({"success": True})

@app.route("/api/transactions/<int:group_id>", methods=["GET"])
def get_transactions(group_id):
    transactions = Transaction.query.filter_by(group_id=group_id).order_by(Transaction.timestamp.desc()).limit(10).all()
    return jsonify([{
        "id": t.id,
        "amount": format_number(t.amount),
        "type": t.type,
        "description": t.description,
        "timestamp": t.timestamp.isoformat()
    } for t in transactions])

@app.route("/api/me", methods=["GET"])
def get_me():
    user = db.session.get(User, 1) # hardcoded user 1 for simplicity
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({
        "id": user.id,
        "name": user.name,
        "balance": format_number(user.balance),
        "phone": user.phone
    })

@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    raw_phone = data.get("phone", "")
    phone = normalize_phone(raw_phone)
    if not phone:
        return jsonify({"error": "Phone number is required."}), 400
        
    user = User.query.filter_by(phone=phone).first()
    if user:
        return jsonify({
            "success": True,
            "registered": True,
            "user": {"id": user.id, "name": user.name, "phone": user.phone, "balance": format_number(user.balance)}
        })
    else:
        return jsonify({
            "success": True,
            "registered": False,
            "phone": phone
        })

@app.route("/api/register", methods=["POST"])
def register():
    data = request.json
    raw_phone = data.get("phone", "")
    name = data.get("name", "").strip()
    phone = normalize_phone(raw_phone)
    
    if not phone or not name:
        return jsonify({"error": "Phone and name are required."}), 400
        
    if User.query.filter_by(phone=phone).first():
        return jsonify({"error": "Phone number already registered."}), 400
        
    new_user = User(name=name, phone=phone, balance=Decimal('0.00'))
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({
        "success": True,
        "user": {"id": new_user.id, "name": new_user.name, "phone": new_user.phone, "balance": 0}
    })

@app.route("/api/history/<int:user_id>", methods=["GET"])
def get_user_history(user_id):
    transactions = Transaction.query.filter_by(user_id=user_id).order_by(Transaction.timestamp.desc()).limit(50).all()
    return jsonify([{
        "id": t.id,
        "amount": format_number(t.amount),
        "type": t.type,
        "description": t.description,
        "timestamp": t.timestamp.isoformat(),
        "group_name": t.group.name if t.group else "App Wallet"
    } for t in transactions])

@app.route("/api/pool", methods=["POST"])
def create_pool():
    data = request.json
    name = data.get("name")
    user_id = data.get("user_id")
    if not name or not user_id:
        return jsonify({"error": "Name and user_id are required."}), 400
    
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404

    join_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    new_group = Group(name=name, balance=Decimal('0.00'), join_code=join_code, admin_id=user.id)
    new_group.members.append(user)
    db.session.add(new_group)
    db.session.commit()

    return jsonify({
        "success": True,
        "group": {
            "id": new_group.id,
            "name": new_group.name,
            "balance": 0,
            "join_code": new_group.join_code,
            "admin_id": new_group.admin_id,
            "members": [{"id": m.id, "name": m.name} for m in new_group.members]
        }
    })

@app.route("/api/pool/join", methods=["POST"])
def join_pool():
    data = request.json
    user_id = data.get("user_id")
    join_code = data.get("join_code")
    
    user = db.session.get(User, user_id)
    group = Group.query.filter_by(join_code=join_code).first()
    
    if not user or not group:
        return jsonify({"error": "Invalid user or join code."}), 404
        
    if user in group.members:
        return jsonify({"error": "You are already a member."}), 400
        
    existing_req = JoinRequest.query.filter_by(group_id=group.id, user_id=user.id, status='pending').first()
    if existing_req:
        return jsonify({"error": "Join request already pending."}), 400

    req = JoinRequest(group_id=group.id, user_id=user.id)
    db.session.add(req)
    db.session.commit()
    
    return jsonify({"success": True, "message": "Join request sent to Admin."})

@app.route("/api/pool/<int:group_id>/requests", methods=["GET"])
def get_join_requests(group_id):
    reqs = JoinRequest.query.filter_by(group_id=group_id, status='pending').all()
    return jsonify([{
        "id": r.id,
        "user_id": r.user_id,
        "user_name": r.user.name,
        "timestamp": r.timestamp.isoformat()
    } for r in reqs])

@app.route("/api/pool/request/resolve", methods=["POST"])
def resolve_join_request():
    data = request.json
    req_id = data.get("request_id")
    action = data.get("action") # 'approve' or 'reject'
    admin_id = data.get("admin_id")
    
    req = db.session.get(JoinRequest, req_id)
    if not req or req.status != 'pending':
        return jsonify({"error": "Invalid or already resolved request."}), 404
        
    group = db.session.get(Group, req.group_id)
    if group.admin_id != admin_id:
        return jsonify({"error": "Unauthorized. Only Admin can resolve requests."}), 403
        
    if action == 'approve':
        req.status = 'approved'
        user = db.session.get(User, req.user_id)
        if user not in group.members:
            group.members.append(user)
    else:
        req.status = 'rejected'
        
    db.session.commit()
    return jsonify({"success": True, "status": req.status})

@app.route("/api/wallet/add", methods=["POST"])
def add_wallet():
    data = request.json
    user_id = data.get("user_id")
    amount = Decimal(str(data.get("amount", 0)))
    
    if amount <= 0:
        return jsonify({"error": "Amount must be positive."}), 400
        
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404
        
    user.balance += amount
    
    # Record top-up transaction (no group)
    tx = Transaction(
        group_id=None,
        user_id=user.id,
        amount=amount,
        type='DEPOSIT',
        description='Added funds to App Wallet'
    )
    db.session.add(tx)
    try:
        db.session.commit()
        return jsonify({"success": True, "new_balance": format_number(user.balance)})
    except IntegrityError as e:
        db.session.rollback()
        return jsonify({"error": "Database constraint failed."}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "An error occurred."}), 500

@app.route("/api/pool/leave", methods=["POST"])
def leave_group():
    data = request.json
    group_id = data.get("group_id")
    user_id = data.get("user_id")

    group = db.session.get(Group, group_id)
    user = db.session.get(User, user_id)

    if not group or not user:
        return jsonify({"error": "Group or user not found."}), 404

    if user in group.members:
        group.members.remove(user)
        db.session.commit()
    
    return jsonify({"success": True})

@app.route("/api/pool/<int:group_id>", methods=["DELETE"])
def delete_group(group_id):
    group = db.session.get(Group, group_id)
    if not group:
        return jsonify({"error": "Group not found."}), 404
    
    # Delete transactions first to avoid constraint issues if any
    Transaction.query.filter_by(group_id=group_id).delete()
    db.session.delete(group)
    db.session.commit()
    return jsonify({"success": True})

@app.route("/api/pool/add", methods=["POST"])
def add_money():
    data = request.json
    group_id = data.get("group_id")
    user_id = data.get("user_id")
    amount = Decimal(str(data.get("amount", "0")))

    if amount <= 0:
        return jsonify({"error": "Amount must be positive."}), 400

    try:
        group = db.session.query(Group).with_for_update().filter_by(id=group_id).first()
        user = db.session.query(User).with_for_update().filter_by(id=user_id).first()
        
        if not group or not user:
            return jsonify({"error": "Invalid group or user."}), 404

        if user.balance < amount:
            db.session.rollback()
            return jsonify({"error": "Insufficient funds in your App Wallet."}), 400

        user.balance -= amount
        group.balance += amount
        tx = Transaction(group_id=group_id, user_id=user_id, amount=amount, type="DEPOSIT", description=data.get("description", "Deposit"))
        db.session.add(tx)
        db.session.commit()

        return jsonify({"success": True, "new_balance": format_number(group.balance), "user_balance": format_number(user.balance)})

    except IntegrityError as e:
        db.session.rollback()
        logger.error(f"Database integrity error: {e}")
        return jsonify({"error": "Database constraint failed."}), 500
    except Exception as e:
        db.session.rollback()
        logger.error(f"Unexpected error: {e}")
        return jsonify({"error": "An error occurred during deposit processing."}), 500

@app.route("/api/pool/pay", methods=["POST"])
def pay_from_pool():
    data = request.json
    group_id = data.get("group_id")
    user_id = data.get("user_id")
    amount = Decimal(str(data.get("amount", "0")))
    description = data.get("description", "Payment")

    if amount <= 0:
        return jsonify({"error": "Amount must be positive."}), 400

    try:
        # Start a transaction with row-level locking
        # This blocks other transactions from modifying this row until we commit/rollback
        group = db.session.query(Group).with_for_update().filter_by(id=group_id).first()
        
        if not group:
            return jsonify({"error": "Group not found."}), 404

        user = db.session.get(User, user_id)
        if not user:
            return jsonify({"error": "User not found."}), 404

        # Simulate some processing time to test concurrency
        if data.get("simulate_delay"):
            time.sleep(1)

        if group.balance < amount:
            # We must explicitly rollback if we decide to abort
            db.session.rollback()
            return jsonify({"error": "Insufficient funds in shared pool.", "balance": format_number(group.balance)}), 400

        # Deduct balance safely
        group.balance -= amount
        
        tx = Transaction(group_id=group_id, user_id=user_id, amount=-amount, type="PAYMENT", description=description)
        db.session.add(tx)
        
        # Commit the transaction to release the lock
        db.session.commit()
        
        return jsonify({"success": True, "new_balance": format_number(group.balance), "message": "Payment successful."})

    except IntegrityError as e:
        db.session.rollback()
        logger.error(f"Database integrity error: {e}")
        return jsonify({"error": "Database constraint failed (e.g. balance went below 0)."}), 500
    except Exception as e:
        db.session.rollback()
        logger.error(f"Unexpected error: {e}")
        return jsonify({"error": "An error occurred during payment processing."}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
