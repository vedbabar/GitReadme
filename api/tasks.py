import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from sqlmodel import Session
from db import engine
from models import Readme
import logic


def send_email_notification(to_email, job_id):
    if not to_email:
        return

    sendgrid_key = os.getenv("SENDGRID_API_KEY")
    sender_email = os.getenv("SENDER_EMAIL")
    frontend_url = os.getenv("FRONTEND_URL")

    if not sendgrid_key or not sender_email or not frontend_url:
        print("[EMAIL] Missing SendGrid configuration")
        return

    share_link = f"{frontend_url}/preview/{job_id}"

    message = Mail(
        from_email=f"GitReadme <{sender_email}>",
        to_emails=to_email,
        subject="Your GitHub README is Ready! 🚀",
        html_content=f"""
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #2563EB;">Your Documentation is Ready</h2>
            <p>We have finished analyzing your repository.</p>
            <br/>
            <a href="{share_link}"
               style="background-color: #2563EB;
                      color: white;
                      padding: 12px 24px;
                      text-decoration: none;
                      border-radius: 6px;">
                View README
            </a>
        </div>
        """
    )

    message.reply_to = sender_email

    try:
        sg = SendGridAPIClient(sendgrid_key)
        sg.send(message)
        print(f"[EMAIL] Sent successfully to {to_email}")

    except Exception as e:
        print(f"[EMAIL] FAILED: {e}")


def background_generate(job_id, repo_url, user_api_key, user_email):
    """
    RQ Worker task:
    - Generate README
    - Store in DB
    - Send email notification
    """
    with Session(engine) as session:
        try:
            print(f"[JOB {job_id}] Processing {repo_url}")

            job = session.get(Readme, job_id)
            if not job:
                print(f"[JOB {job_id}] Job not found")
                return

            markdown = logic.clone_and_process_repo(repo_url)

            job.status = "COMPLETED"
            job.content = markdown
            session.add(job)
            session.commit()

            print(f"[JOB {job_id}] README generated and saved")

            # Send email
            if user_email:
                send_email_notification(user_email, job_id)

        except Exception as e:
            print(f"[JOB {job_id}] FAILED: {e}")

            if job:
                job.status = "FAILED"
                job.content = str(e)
                session.add(job)
                session.commit()
