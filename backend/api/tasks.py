import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from prisma import Prisma
import logic 

# Email Configuration
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 465
SENDER_EMAIL = os.getenv("SENDER_EMAIL") 
SENDER_PASSWORD = os.getenv("SENDER_PASSWORD") 

def send_email_notification(to_email, job_id):
    """Sends a unique shareable link to the user via Email."""
    if not to_email:
        return

    share_link = f"http://localhost:3000/preview/{job_id}"
    print(f" Sending email to {to_email}...")

    msg = MIMEMultipart()
    msg['From'] = f"GitReadme <{SENDER_EMAIL}>"
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
        if SENDER_PASSWORD and "your-app-password" not in SENDER_PASSWORD:
            with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT) as server:
                server.login(SENDER_EMAIL, SENDER_PASSWORD)
                server.sendmail(SENDER_EMAIL, to_email, msg.as_string())
            print(f" Email sent successfully!")
        else:
            print(f" Email skipped: SENDER_PASSWORD not configured.")
    except Exception as e:
        print(f" Failed to send email: {e}")

def background_generate(job_id, repo_url, user_api_key, user_email):
    """
    The Task Function ran by the Worker.
    """
    db = Prisma()
    db.connect()

    try:
        print(f" [Job {job_id}] Processing {repo_url}...")
        
        markdown = logic.clone_and_process_repo(repo_url)
        
        db.readme.update(
            where={"id": job_id},
            data={
                "status": "COMPLETED",
                "content": markdown
            }
        )
        print(f" [Job {job_id}] DB Updated.")

        if user_email:
            send_email_notification(user_email, job_id)
        
    except Exception as e:
        print(f" [Job {job_id}] Failed: {e}")
        db.readme.update(
            where={"id": job_id},
            data={
                "status": "FAILED",
                "content": str(e)
            }
        )
    finally:
        # Always disconnect in the worker
        if db.is_connected():
            db.disconnect()