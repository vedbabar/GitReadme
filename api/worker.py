import sys
import os

# Ensure the worker can find your local files
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from redis_conn import conn
from rq import Worker, Queue, SimpleWorker

if __name__ == '__main__':
    print(" Worker started! Listening for jobs...")
    
    try:
        queue = Queue('default', connection=conn)

        if os.name == 'nt':
            print(" Windows detected: Using SimpleWorker (No fork)")
            worker = SimpleWorker([queue], connection=conn)
        else:
            worker = Worker([queue], connection=conn)
            
        worker.work()
        
    except KeyboardInterrupt:
        print("\n Worker stopped.")