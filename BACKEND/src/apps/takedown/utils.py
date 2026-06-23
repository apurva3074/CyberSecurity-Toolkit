import socket
from urllib.parse import urlparse

import whois


def identify_hosting_provider(url):
    """Look up WHOIS info for a URL and return hosting provider + abuse email."""
    try:
        domain = urlparse(url).netloc or urlparse(url).path
        domain = domain.split(':')[0]

        w = whois.whois(domain)
        org = ''
        if isinstance(w.org, list):
            org = w.org[0] or ''
        elif w.org:
            org = w.org

        emails = w.emails or []
        if isinstance(emails, str):
            emails = [emails]

        abuse_email = ''
        for email in emails:
            if 'abuse' in email.lower():
                abuse_email = email
                break
        if not abuse_email and emails:
            abuse_email = emails[0]

        return {
            'hosting_provider': org or domain,
            'abuse_email': abuse_email,
            'registrar': w.registrar or '',
        }
    except Exception:
        return {
            'hosting_provider': '',
            'abuse_email': '',
            'registrar': '',
        }


def generate_abuse_email(takedown_request):
    """Generate a professional abuse complaint email body."""
    return (
        f"Subject: Abuse Report — Malicious Website Takedown Request\n\n"
        f"Dear Abuse Team,\n\n"
        f"We are writing to report a malicious website hosted on your infrastructure "
        f"that is being used for phishing/scam activities.\n\n"
        f"Malicious URL: {takedown_request.malicious_url}\n"
        f"Hosting Provider: {takedown_request.hosting_provider}\n\n"
        f"Description of Malicious Activity:\n"
        f"{takedown_request.description}\n\n"
        f"We have attached evidence (screenshot) confirming the malicious nature of this website. "
        f"We kindly request that you investigate and take appropriate action to suspend or remove "
        f"this content as soon as possible.\n\n"
        f"This website poses a direct threat to users and may be involved in:\n"
        f"- Phishing attacks targeting user credentials\n"
        f"- Distribution of malware\n"
        f"- Financial fraud or scam operations\n\n"
        f"Please acknowledge receipt of this report and provide a timeline for resolution.\n\n"
        f"Thank you for your prompt attention to this matter.\n\n"
        f"Best regards,\n"
        f"Zentrya Security Team\n"
        f"Automated Takedown Request System"
    )