import smtplib
import os
from dotenv import load_dotenv 
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from sqlmodel import Session  
from db import engine          
from models import Readme    
import logic 


load_dotenv()

# Email Configuration
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587  # <--- CHANGED: Port 587 is safer for Cloud/Render

def send_email_notification(to_email, job_id):
    """Sends a unique shareable link to the user via Email."""
    
    # --- FIX: Load variables INSIDE the function ---
    sender_email = os.getenv("SENDER_EMAIL") 
    sender_password = os.getenv("SENDER_PASSWORD")
    # -----------------------------------------------

    if not to_email:
        return

    share_link = f"http://localhost:3000/preview/{job_id}"
    print(f" Sending email to {to_email}...")

    msg = MIMEMultipart()
    msg['From'] = f"GitReadme <{sender_email}>"
    msg['To'] = to_email
    msg['Subject'] = "Your GitHub README is Ready! 🚀"

    body = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #2563EB;">Your Documentation is Ready</h2>
        <p>We have finished analyzing your repository.</p>
        <br/>
        <a href="{share_link}" style="background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            View README
        </a>
    </div>
    """
    msg.attach(MIMEText(body, 'html'))

    try:
        # Check if password exists
        if sender_password and "your-app-password" not in sender_password:
            # --- UPDATED: Use SMTP + starttls() instead of SMTP_SSL ---
            with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
                server.starttls()  # <--- Secure the connection manually
                server.login(sender_email, sender_password)
                server.sendmail(sender_email, to_email, msg.as_string())
            print(f" Email sent successfully!")
        else:
            print(f" Email skipped: SENDER_PASSWORD not configured or incorrect.")
    except Exception as e:
        print(f" Failed to send email: {e}")

def background_generate(job_id, repo_url, user_api_key, user_email):
    """
    The Task Function ran by the Worker.
    """
    with Session(engine) as session:
        try:
            print(f" [Job {job_id}] Processing {repo_url}...")
            
            # Fetch the job object first
            job = session.get(Readme, job_id)
            if not job:
                print(f" [Job {job_id}] Error: Job not found in DB")
                return

            # Run logic
            markdown = logic.clone_and_process_repo(repo_url)
            
            # Update Success
            job.status = "COMPLETED"
            job.content = markdown
            session.add(job)
            session.commit()
            
            print(f" [Job {job_id}] DB Updated.")

            if user_email:
                send_email_notification(user_email, job_id)
        
        except Exception as e:
            print(f" [Job {job_id}] Failed: {e}")
            
            # Update Failure
            if 'job' in locals() and job:
                job.status = "FAILED"
                job.content = str(e)
                session.add(job)
                session.commit()
