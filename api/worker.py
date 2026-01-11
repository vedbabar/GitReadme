import sys
import os
import logging
import time
from redis_conn import conn
from rq import Worker, Queue, SimpleWorker

# 1. SETUP LOGGING (Crucial to see what's happening)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Ensure the worker can find your local files
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# 2. PREVENT "WARM SHUTDOWN" ON CLOUD (Render/Heroku/Railway)
# If you deploy this as a "Web Service", it needs to listen on a port or it gets killed.
# If you are deploying as a "Background Worker", you can remove this block.
if os.environ.get('RENDER') or os.environ.get('PORT'):
    from threading import Thread
    from http.server import HTTPServer, BaseHTTPRequestHandler

    class HealthCheck(BaseHTTPRequestHandler):
        def do_GET(self):
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"Worker is alive")
    
    def start_health_check():
        port = int(os.environ.get("PORT", 8000))
        server = HTTPServer(('0.0.0.0', port), HealthCheck)
        print(f"❤️  Health check running on port {port}")
        server.serve_forever()

    # Start the dummy server in a separate thread
    t = Thread(target=start_health_check, daemon=True)
    t.start()

if __name__ == '__main__':
    print("🚀 Worker started! Listening for jobs on 'default'...")

    try:
        # 3. VERIFY QUEUE NAME
        # Ensure your producer is sending to 'default' too!
        queue = Queue('default', connection=conn)

        if os.name == 'nt':
            print("💻 Windows detected: Using SimpleWorker")
            worker = SimpleWorker([queue], connection=conn)
        else:
            worker = Worker([queue], connection=conn)
        
        # This will block and process jobs
        worker.work(with_scheduler=True)
        
    except KeyboardInterrupt:
        print("\n🛑 Worker stopped manually.")
    except Exception as e:
        print(f"\n❌ CRITICAL ERROR: {e}")
