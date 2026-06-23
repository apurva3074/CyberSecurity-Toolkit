from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from apps.scan_logs.utils import log_scan
from bs4 import BeautifulSoup
import requests
import ssl
import socket
import datetime
import whois
from urllib.parse import urlparse


class MetadataView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        url = request.data.get('url')
        if not url:
            return Response({'error': 'No URL provided.'}, status=status.HTTP_400_BAD_REQUEST)

        url = url.strip()
        if not url.startswith('http'):
            url = 'https://' + url

        parsed = urlparse(url)
        domain = parsed.netloc

        metadata = {
            'url': url,
            'website_info': {},
            'ssl_info': {},
            'domain_info': {},
            'server_info': {},
            'risk_level': ''
        }

        try:
            # 1. Fetch HTML
            response = requests.get(url, timeout=8)
            soup = BeautifulSoup(response.text, 'html.parser')

            # Website info: title, description, favicon (robust)
            title = soup.title.string.strip() if soup.title and soup.title.string else 'N/A'
            desc_tag = soup.find('meta', attrs={'name': 'description'})
            description = desc_tag.get('content').strip() if desc_tag and desc_tag.get('content') else 'N/A'

            # Try finding favicon in common rel attributes
            from urllib.parse import urljoin

            favicon = None
            for rel in ('icon', 'shortcut icon', 'apple-touch-icon'):
                tag = soup.find('link', rel=rel)
                if tag and tag.get('href'):
                    href = tag.get('href').strip()
                    favicon = urljoin(url, href)
                    break

            # fallback to /favicon.ico
            if not favicon:
                try:
                    ico_url = urljoin(url, '/favicon.ico')
                    rico = requests.head(ico_url, timeout=4)
                    if rico.status_code == 200 and 'image' in rico.headers.get('Content-Type', ''):
                        favicon = ico_url
                except Exception:
                    favicon = None

            metadata['website_info'] = {
                'title': title,
                'description': description,
                'favicon': favicon or 'N/A',
            }

            # 2. SSL Certificate Info
            try:
                context = ssl.create_default_context()
                with socket.create_connection((domain, 443), timeout=5) as sock:
                    with context.wrap_socket(sock, server_hostname=domain) as ssock:
                        cert = ssock.getpeercert()

                issuer = dict(x[0] for x in cert.get('issuer', []))
                # cert times are in format like 'Oct 10 00:00:00 2025 GMT'
                valid_from = datetime.datetime.strptime(cert.get('notBefore'), '%b %d %H:%M:%S %Y %Z') if cert.get('notBefore') else None
                valid_to = datetime.datetime.strptime(cert.get('notAfter'), '%b %d %H:%M:%S %Y %Z') if cert.get('notAfter') else None

                metadata['ssl_info'] = {
                    'issuer': issuer.get('organizationName', 'N/A'),
                    'valid_from': valid_from.strftime('%Y-%m-%d') if valid_from else 'N/A',
                    'valid_to': valid_to.strftime('%Y-%m-%d') if valid_to else 'N/A',
                    'ssl_valid': (valid_to > datetime.datetime.now(datetime.timezone.utc)) if valid_to else False,
                }
            except Exception:
                metadata['ssl_info'] = {'error': 'SSL not available'}

            # 3. WHOIS Info (use package API, with an RDAP HTTP fallback)
            try:
                # try the whois package first
                w = whois.whois(domain)

                def _get_field(obj, key):
                    try:
                        if isinstance(obj, dict):
                            return obj.get(key)
                        return getattr(obj, key, None)
                    except Exception:
                        return None

                def _norm(val):
                    try:
                        if val is None:
                            return 'N/A'
                        if isinstance(val, list):
                            val = val[0]
                        if hasattr(val, 'isoformat'):
                            return val.date().isoformat()
                        return str(val)
                    except Exception:
                        return str(val)

                metadata['domain_info'] = {
                    'registrar': _norm(_get_field(w, 'registrar')),
                    'creation_date': _norm(_get_field(w, 'creation_date')),
                    'expiration_date': _norm(_get_field(w, 'expiration_date')),
                    'country': _norm(_get_field(w, 'country')),
                    'source': 'whois',
                }

            except Exception as exc:
                # Common Windows failure: whois package tries to call a system `whois` binary
                detail = str(exc)
                hint = None
                if 'The system cannot find the file specified' in detail or 'No such file or directory' in detail:
                    hint = 'On Windows, install a whois client or enable tryInstallMissingWhoisOnWindows in the whois package.'

                # Try RDAP HTTP fallback (rdap.org)
                try:
                    rdap_url = f'https://rdap.org/domain/{domain}'
                    r = requests.get(rdap_url, timeout=8)
                    if r.status_code == 200:
                        rd = r.json()

                        # extract registrar-like name
                        registrar = rd.get('registrar') or rd.get('registrarName') or 'N/A'

                        # events may contain creation/expiration
                        creation = 'N/A'
                        expiration = 'N/A'
                        for ev in rd.get('events', []) or []:
                            action = (ev.get('eventAction') or '').lower()
                            dt = ev.get('eventDate')
                            if action and dt:
                                if 'registration' in action and creation == 'N/A':
                                    creation = dt.split('T')[0]
                                if ('expiration' in action or 'expire' in action) and expiration == 'N/A':
                                    expiration = dt.split('T')[0]

                        # try to extract country from entities vcard if available
                        country = 'N/A'
                        ents = rd.get('entities') or []
                        if ents:
                            for e in ents:
                                vcard = e.get('vcardArray')
                                if vcard and isinstance(vcard, list) and len(vcard) >= 2:
                                    for entry in vcard[1]:
                                        if entry and isinstance(entry, list) and entry[0] == 'adr':
                                            # adr entries may contain country in the 6th position
                                            adr = entry[3] if len(entry) > 3 else None
                                            if adr:
                                                # adr is a list of address fields, try last element
                                                if isinstance(adr, list) and len(adr) > 0 and adr[-1]:
                                                    country = adr[-1]
                                                else:
                                                    country = str(adr)
                                                break
                                if country != 'N/A':
                                    break

                        metadata['domain_info'] = {
                            'registrar': str(registrar),
                            'creation_date': creation,
                            'expiration_date': expiration,
                            'country': country,
                            'source': 'rdap',
                        }
                    else:
                        metadata['domain_info'] = {'error': 'WHOIS lookup failed', 'detail': detail, 'hint': hint}
                except Exception as rdap_exc:
                    metadata['domain_info'] = {
                        'error': 'WHOIS lookup failed',
                        'detail': detail,
                        'rdap_error': str(rdap_exc),
                        'hint': hint,
                    }

            # 4. Server Info
            metadata['server_info'] = {
                'server': response.headers.get('Server', 'N/A'),
                'content_type': response.headers.get('Content-Type', 'N/A'),
                'security_headers': {
                    'HSTS': 'Strict-Transport-Security' in response.headers,
                    'CSP': 'Content-Security-Policy' in response.headers,
                    'X-Frame-Options': 'X-Frame-Options' in response.headers,
                },
            }

            # 5. Simple Risk Analysis
            risk = '✅ Safe'
            now = datetime.datetime.now(datetime.timezone.utc)
            creation_date = metadata['domain_info'].get('creation_date') if isinstance(metadata['domain_info'], dict) else None
            if 'ssl_valid' in metadata['ssl_info'] and not metadata['ssl_info'].get('ssl_valid'):
                risk = '⚠️ Expired SSL Certificate'
            elif creation_date and 'error' not in metadata['domain_info']:
                try:
                    # whois library may return a list or datetime; coerce to string and parse
                    date_obj = datetime.datetime.fromisoformat(str(creation_date).split()[0])
                    if (now - date_obj).days < 30:
                        risk = '⚠️ Newly Registered Domain'
                except Exception:
                    pass

            metadata['risk_level'] = risk

            is_risky = 'Safe' not in risk
            log_scan('metadata', url, result=risk, is_threat=is_risky, request=request)

            return Response(metadata)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
