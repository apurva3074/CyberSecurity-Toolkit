from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.community.models import Question, Answer

class Command(BaseCommand):
    help = 'Load pre-answered community questions.'

    def handle(self, *args, **kwargs):
        User = get_user_model()
        # Create users if not exist
        users = {}
        for username in ['alice', 'bob', 'carol', 'dave', 'erin', 'frank', 'gina', 'harry', 'ivy', 'jack']:
            user, _ = User.objects.get_or_create(username=username)
            users[username] = user

        # Pre-answered questions
        questions = [
            {
                'title': 'How do I scan a URL for malware?',
                'body': 'Is there a recommended workflow inside this toolkit for scanning URLs?',
                'author': users['alice'],
                'answers': [
                    {'body': 'Use the UrlScanner page and paste the URL. It runs a suite of checks and returns a verdict.', 'author': users['bob']},
                    {'body': 'You can also cross-check with the EmailScanner if the URL arrived in an email.', 'author': users['carol']},
                ]
            },
            {
                'title': 'Best way to report takedown requests?',
                'body': 'I found infringing content; what is the recommended way to submit a takedown request through the app?',
                'author': users['dave'],
                'answers': [
                    {'body': 'Use the TakedownRequest page — it walks you through required fields and evidence.', 'author': users['erin']},
                ]
            },
            {
                'title': 'Can I integrate with my Slack workspace?',
                'body': 'Would like to post scan results into a Slack channel automatically.',
                'author': users['frank'],
                'answers': [
                    {'body': 'There is no built-in Slack integration yet, but you can use webhooks with the API to push results.', 'author': users['alice']},
                    {'body': 'If you want, I can help add a simple integration using an incoming webhook.', 'author': users['bob']},
                ]
            },
            {
                'title': 'Glossary suggestions - add terms?',
                'body': 'How can I propose new glossary terms and definitions?',
                'author': users['gina'],
                'answers': [
                    {'body': 'Open the Glossary page and use the suggestion form at the bottom.', 'author': users['harry']},
                ]
            },
            {
                'title': 'Rate limits when scanning lots of URLs?',
                'body': 'If I batch scan hundreds of URLs, will the service throttle me?',
                'author': users['ivy'],
                'answers': [
                    {'body': 'There is a rate limit on the backend API; consider batching and adding a short delay between requests.', 'author': users['jack']},
                    {'body': 'Also consider caching results to avoid re-scanning the same URL too often.', 'author': users['carol']},
                ]
            },
        ]

        for q in questions:
            question, _ = Question.objects.get_or_create(title=q['title'], defaults={'body': q['body'], 'author': q['author']})
            for ans in q['answers']:
                Answer.objects.get_or_create(question=question, body=ans['body'], author=ans['author'])

        self.stdout.write(self.style.SUCCESS('Pre-answered questions loaded.'))
