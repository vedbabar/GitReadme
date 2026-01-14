from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlmodel import Session, select, desc  
from db import engine, init_db             
from models import Readme                  
import logic 

from rq import Queue
from redis_conn import conn
from tasks import background_generate, send_email_notification 
from datetime import timedelta
import os

app = Flask(__name__)
CORS(app)

q = Queue(connection=conn)

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "GitReadme Backend is running!"})

@app.route('/api/generate', methods=['POST'])
def start_generation_job():
    data = request.json
    print(f" Received Payload: {data}")

    repo_url = data.get('repoUrl') or data.get('git_url')
    user_id = data.get('userId')
    user_email = data.get('email')
    user_api_key = data.get('apiKey')

    if not repo_url:
        return jsonify({"error": "repoUrl is required"}), 400
    
    try:
        with Session(engine) as session:
            statement = select(Readme).where(Readme.repoUrl == repo_url)
            existing = session.exec(statement).first()

            if existing and existing.status == "COMPLETED":
                if user_email:
                    print(f"⚡ Cache Hit! Queueing email for {user_email}")
                    q.enqueue(send_email_notification, user_email, existing.id)
                
                return jsonify({
                    "jobId": existing.id, 
                    "message": "Returned from cache"
                })

            try:
                client_ip = request.headers.get('X-Forwarded-For', request.remote_addr).split(',')[0].strip()
                rate_key = f"rate_limit:{client_ip}"
                current_usage = conn.get(rate_key)
                
                if current_usage and int(current_usage) >= 2:
                    print(f" Rate Limit Hit for {client_ip}")
                    return jsonify({
                        "error": "Daily limit reached",
                        "message": "You have generated 2 READMEs today. Please try again tomorrow."
                    }), 429

                new_count = conn.incr(rate_key)
                if new_count == 1:
                    conn.expire(rate_key, timedelta(hours=24))
                    
                print(f" User {client_ip} usage: {new_count}/2")

            except Exception as e:
                print(f" Rate limit check failed (Redis error?): {e}")
                pass

            # 3. CREATE NEW JOB
            new_readme = Readme(
                repoUrl=repo_url,
                status="PENDING",
                userId=user_id,
                userEmail=user_email
            )
            session.add(new_readme)
            session.commit()
            session.refresh(new_readme) 

            q.enqueue(
                background_generate,  
                new_readme.id,        
                repo_url,             
                user_api_key,         
                user_email            
            )

            return jsonify({
                "jobId": new_readme.id, 
                "message": "Generation started (Queued)"
            })

    except Exception as e:
        print(f"Database Error: {e}")
        return jsonify({"error": f"Failed to start job: {str(e)}"}), 500


@app.route('/api/status/<job_id>', methods=['GET'])
def check_job_status(job_id):
    try:
        with Session(engine) as session:
            record = session.get(Readme, job_id)
            if not record:
                return jsonify({"error": "Job not found"}), 404
                
            return jsonify({
                "id": record.id,
                "status": record.status,
                "content": record.content, 
                "repoUrl": record.repoUrl,
                "createdAt": str(record.createdAt)
            })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/history', methods=['GET'])
def get_user_history():
    user_id = request.args.get('userId')
    if not user_id:
        return jsonify({"error": "userId required"}), 400
        
    try:
        with Session(engine) as session:
            statement = select(Readme).where(Readme.userId == user_id).order_by(desc(Readme.createdAt)).limit(15)
            history = session.exec(statement).all()
            
            results = []
            for h in history:
                results.append({
                    "id": h.id,
                    "repoUrl": h.repoUrl,
                    "status": h.status,
                    "createdAt": str(h.createdAt)
                })
            return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    from dotenv import load_dotenv
    load_dotenv()
    init_db()
    print(" Database initialized (Tables created)")

    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
