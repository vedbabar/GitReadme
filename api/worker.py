import sys
import os
import logging
import time
from redis_conn import conn
from rq import Worker, Queue, SimpleWorker

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

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
        print(f" Health check running on port {port}")
        server.serve_forever()

    t = Thread(target=start_health_check, daemon=True)
    t.start()

if __name__ == '__main__':
    print(" Worker started! Listening for jobs on 'default'...")

    try:
        queue = Queue('default', connection=conn)

        if os.name == 'nt':
            print(" Windows detected: Using SimpleWorker")
            worker = SimpleWorker([queue], connection=conn)
        else:
            worker = Worker([queue], connection=conn)

        worker.work(with_scheduler=True)
        
    except KeyboardInterrupt:
        print("\n Worker stopped manually.")
    except Exception as e:
        print(f"\n CRITICAL ERROR: {e}")
