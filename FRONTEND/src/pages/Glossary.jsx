import { useState } from 'react';
import {
  HiOutlineSearch,
  HiOutlineShieldCheck,
  HiOutlineMail,
  HiOutlineLink,
  HiOutlineGlobe,
  HiOutlineLockClosed,
  HiOutlineExclamationCircle,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
} from 'react-icons/hi';

const glossaryVideo = new URL('../assets/video-design.mp4', import.meta.url).href;

const CATEGORIES = [
  { id: 'all', label: 'All', icon: HiOutlineShieldCheck },
  { id: 'phishing', label: 'Phishing & Scams', icon: HiOutlineExclamationCircle },
  { id: 'email', label: 'Email Security', icon: HiOutlineMail },
  { id: 'web', label: 'Web Security', icon: HiOutlineLink },
  { id: 'network', label: 'Network & DNS', icon: HiOutlineGlobe },
  { id: 'malware', label: 'Malware', icon: HiOutlineLockClosed },
  { id: 'general', label: 'General Security', icon: HiOutlineShieldCheck },
];

const GLOSSARY_DATA = [
  // ── Phishing & Scams ──
  {
    term: 'Phishing',
    category: 'phishing',
    relatedTool: 'URL Scanner',
    definition: 'A cyberattack where attackers disguise themselves as trustworthy entities to trick victims into revealing sensitive information such as passwords, credit card numbers, or personal data. Phishing is typically carried out through fake emails, websites, or messages that closely mimic legitimate ones.',
    howItWorks: 'The attacker creates a fake website or email that looks identical to a legitimate service (like a bank or social media platform). The victim clicks a malicious link, enters their credentials, and the attacker captures the data. Modern phishing attacks often use HTTPS and realistic domain names to appear legitimate.',
    prevention: [
      'Always verify the URL before entering credentials',
      'Look for misspellings in domain names',
      'Use Zentrya\'s URL Scanner to check suspicious links',
      'Enable two-factor authentication on all accounts',
    ],
  },
  {
    term: 'Spear Phishing',
    category: 'phishing',
    relatedTool: 'Email Scanner',
    definition: 'A targeted form of phishing where attackers customize their attack for a specific individual or organization. Unlike regular phishing which casts a wide net, spear phishing uses personal information about the target to make the attack more convincing.',
    howItWorks: 'Attackers research their target using social media, company websites, and public records. They then craft a personalized email that references real colleagues, projects, or events. The email may contain a malicious link or attachment that installs malware or steals credentials.',
    prevention: [
      'Be suspicious of unexpected emails even from known contacts',
      'Verify requests for sensitive information through a different channel',
      'Use email authentication protocols (SPF, DKIM, DMARC)',
      'Scan suspicious emails with Zentrya\'s Email Scanner',
    ],
  },
  {
    term: 'Whaling',
    category: 'phishing',
    relatedTool: 'Email Scanner',
    definition: 'A highly targeted phishing attack aimed at senior executives and high-profile individuals within an organization. Named because the targets are the "big fish" — CEOs, CFOs, and other C-suite executives who have access to sensitive data and financial authority.',
    howItWorks: 'Whaling emails often impersonate other executives, legal authorities, or business partners. They may request urgent wire transfers, confidential employee data, or tax information. These emails are carefully crafted to match the tone and style of legitimate business communication.',
    prevention: [
      'Implement strict verification for financial transactions',
      'Train executives to recognize social engineering tactics',
      'Use multi-person approval for wire transfers',
      'Never share sensitive data via email without verification',
    ],
  },
  {
    term: 'Vishing',
    category: 'phishing',
    definition: 'Voice phishing — a social engineering attack conducted over phone calls. Attackers impersonate banks, tech support, government agencies, or other trusted entities to trick victims into revealing personal or financial information.',
    howItWorks: 'The attacker calls the victim, often spoofing a legitimate phone number. They create urgency — claiming the victim\'s account has been compromised, they owe taxes, or their computer has a virus. The victim is pressured into providing sensitive information or making payments.',
    prevention: [
      'Never give sensitive information over unsolicited phone calls',
      'Hang up and call the organization directly using their official number',
      'Be skeptical of calls creating urgency or fear',
      'Register your number on the Do Not Call registry',
    ],
  },
  {
    term: 'Smishing',
    category: 'phishing',
    relatedTool: 'URL Scanner',
    definition: 'SMS phishing — phishing attacks delivered via text messages. Attackers send fraudulent SMS messages containing malicious links or requests for personal information, often impersonating delivery services, banks, or government agencies.',
    howItWorks: 'The victim receives a text message that appears to come from a trusted source, such as "Your package delivery failed, click here to reschedule" or "Unusual activity detected on your bank account." The link leads to a fake website designed to steal credentials.',
    prevention: [
      'Don\'t click links in unexpected text messages',
      'Verify by contacting the company directly',
      'Use Zentrya\'s URL Scanner to check suspicious links',
      'Report smishing messages to your carrier',
    ],
  },
  {
    term: 'Social Engineering',
    category: 'phishing',
    definition: 'The psychological manipulation of people into performing actions or divulging confidential information. Rather than exploiting software vulnerabilities, social engineering exploits human psychology — trust, fear, curiosity, and helpfulness.',
    howItWorks: 'Social engineers use various techniques: pretexting (creating a fabricated scenario), baiting (offering something enticing), tailgating (following someone into a restricted area), and quid pro quo (offering a service in exchange for information). The goal is always to bypass security by manipulating people.',
    prevention: [
      'Verify identity before sharing any information',
      'Be suspicious of unsolicited requests for help or information',
      'Follow the principle of least privilege',
      'Create a security-aware culture in your organization',
    ],
  },
  {
    term: 'Typosquatting',
    category: 'phishing',
    relatedTool: 'URL Scanner',
    definition: 'A technique where attackers register domain names that are slight misspellings of popular websites (e.g., gooogle.com, faceboook.com, amaz0n.com). When users accidentally mistype a URL, they land on a malicious site that looks identical to the real one.',
    howItWorks: 'Attackers register domains with common typos, letter substitutions (0 for o, 1 for l), or different TLDs (.co instead of .com). The fake site mimics the legitimate one and captures any credentials or payment information the victim enters.',
    prevention: [
      'Always double-check URLs before entering credentials',
      'Use bookmarks for important websites',
      'Scan URLs with Zentrya\'s URL Scanner',
      'Look for HTTPS and valid SSL certificates',
    ],
  },

  // ── Email Security ──
  {
    term: 'Spam',
    category: 'email',
    relatedTool: 'Email Scanner',
    definition: 'Unsolicited bulk email messages sent to large numbers of recipients, typically for advertising, phishing, or spreading malware. Spam accounts for roughly 45% of all emails sent worldwide.',
    howItWorks: 'Spammers collect email addresses from data breaches, web scraping, or purchasing lists. They use botnets (networks of compromised computers) to send millions of emails. Modern spam often contains phishing links, malware attachments, or fraudulent offers.',
    prevention: [
      'Use spam filters and email security tools',
      'Never reply to spam emails',
      'Don\'t click unsubscribe links in suspicious emails',
      'Use Zentrya\'s Email Scanner to analyze suspicious messages',
    ],
  },
  {
    term: 'Email Spoofing',
    category: 'email',
    relatedTool: 'Email Scanner',
    definition: 'The forgery of an email header so that the message appears to come from someone other than the actual sender. This is a common technique in phishing attacks, business email compromise (BEC), and spam campaigns.',
    howItWorks: 'The SMTP protocol doesn\'t have built-in authentication, so anyone can set any "From" address. Attackers modify email headers to make messages appear to come from trusted sources like your boss, your bank, or a colleague. The email passes through the internet with this forged identity.',
    prevention: [
      'Implement SPF, DKIM, and DMARC on your domain',
      'Check email headers for mismatched sender information',
      'Be suspicious of emails requesting urgent action',
      'Verify the sender through a separate communication channel',
    ],
  },
  {
    term: 'SPF (Sender Policy Framework)',
    category: 'email',
    relatedTool: 'Metadata Fetcher',
    definition: 'An email authentication protocol that allows domain owners to specify which mail servers are authorized to send email on behalf of their domain. SPF helps prevent email spoofing by publishing a list of authorized senders in DNS records.',
    howItWorks: 'The domain owner publishes an SPF record in their DNS. When a receiving mail server gets an email, it checks the sender\'s IP address against the SPF record. If the IP isn\'t authorized, the email can be rejected or flagged as suspicious.',
    prevention: [
      'Publish an SPF record for your domain',
      'Include all legitimate sending services in your SPF record',
      'Combine SPF with DKIM and DMARC for full protection',
      'Regularly audit your SPF records',
    ],
  },
  {
    term: 'DKIM (DomainKeys Identified Mail)',
    category: 'email',
    definition: 'An email authentication method that adds a digital signature to outgoing emails. This signature allows the receiving server to verify that the email was actually sent by the domain it claims to be from and hasn\'t been modified in transit.',
    howItWorks: 'The sending server signs the email with a private cryptographic key. The corresponding public key is published in the domain\'s DNS records. The receiving server uses the public key to verify the signature, confirming the email\'s authenticity and integrity.',
    prevention: [
      'Configure DKIM signing for all outgoing emails',
      'Use strong key lengths (2048-bit minimum)',
      'Rotate DKIM keys periodically',
      'Monitor DKIM alignment in DMARC reports',
    ],
  },
  {
    term: 'DMARC (Domain-based Message Authentication)',
    category: 'email',
    definition: 'An email authentication protocol that builds on SPF and DKIM. DMARC allows domain owners to publish a policy that tells receiving servers what to do with emails that fail authentication — none (monitor), quarantine, or reject.',
    howItWorks: 'When an email arrives, the receiving server checks SPF and DKIM. If both fail, it consults the sender\'s DMARC policy to decide what action to take. DMARC also provides reporting, so domain owners can see who is sending email using their domain.',
    prevention: [
      'Start with a DMARC policy of "none" to monitor traffic',
      'Gradually move to "quarantine" then "reject"',
      'Review DMARC aggregate reports regularly',
      'Ensure all legitimate senders pass SPF and DKIM',
    ],
  },

  // ── Web Security ──
  {
    term: 'SSL/TLS',
    category: 'web',
    relatedTool: 'Metadata Fetcher',
    definition: 'Secure Sockets Layer (SSL) and its successor Transport Layer Security (TLS) are cryptographic protocols that provide encrypted communication between a web browser and a server. They ensure data privacy, integrity, and authentication.',
    howItWorks: 'When you visit an HTTPS website, your browser and the server perform a "handshake" — they agree on encryption algorithms, the server presents its SSL certificate for verification, and a secure encrypted connection is established. All data transferred is encrypted and can\'t be read by eavesdroppers.',
    prevention: [
      'Always look for HTTPS in the URL bar',
      'Use Zentrya\'s Metadata Fetcher to check SSL certificate validity',
      'Don\'t enter sensitive data on HTTP sites',
      'Keep browsers updated for latest TLS support',
    ],
  },
  {
    term: 'HTTPS',
    category: 'web',
    relatedTool: 'URL Scanner',
    definition: 'HyperText Transfer Protocol Secure — the secure version of HTTP. HTTPS encrypts data between your browser and the website using SSL/TLS, preventing eavesdropping and man-in-the-middle attacks. Indicated by a padlock icon in the browser address bar.',
    howItWorks: 'HTTPS wraps normal HTTP communication inside SSL/TLS encryption. Every piece of data — URLs, form submissions, cookies, headers — is encrypted before transmission. This prevents ISPs, hackers on public Wi-Fi, and other intermediaries from seeing or modifying the data.',
    prevention: [
      'Always verify HTTPS before entering credentials',
      'Note: HTTPS alone doesn\'t guarantee a site is safe — phishing sites can have HTTPS too',
      'Use Zentrya\'s URL Scanner for comprehensive safety checks',
      'Install browser extensions that force HTTPS connections',
    ],
  },
  {
    term: 'XSS (Cross-Site Scripting)',
    category: 'web',
    definition: 'A web vulnerability where attackers inject malicious scripts into web pages viewed by other users. The script runs in the victim\'s browser with the same permissions as the legitimate website, potentially stealing cookies, session tokens, or personal data.',
    howItWorks: 'An attacker finds a web page that displays user input without proper sanitization. They inject JavaScript code (e.g., through a comment field or URL parameter). When another user views that page, the malicious script executes in their browser, potentially stealing their session cookie or redirecting them to a phishing site.',
    prevention: [
      'Sanitize and validate all user inputs',
      'Use Content Security Policy (CSP) headers',
      'Encode output data before rendering in HTML',
      'Use modern frameworks that auto-escape output',
    ],
  },
  {
    term: 'CSRF (Cross-Site Request Forgery)',
    category: 'web',
    definition: 'An attack that tricks authenticated users into submitting unwanted requests to a web application. If the user is logged into a banking site, a CSRF attack could force their browser to make a transfer without their knowledge.',
    howItWorks: 'The victim visits a malicious website while logged into a target application. The malicious site contains hidden forms or image tags that automatically send requests to the target application. Since the victim\'s browser includes their authentication cookies, the request appears legitimate.',
    prevention: [
      'Use anti-CSRF tokens in forms',
      'Implement SameSite cookie attributes',
      'Verify the Origin and Referer headers',
      'Require re-authentication for sensitive actions',
    ],
  },
  {
    term: 'Man-in-the-Middle (MITM) Attack',
    category: 'web',
    definition: 'An attack where the attacker secretly intercepts and potentially alters communication between two parties who believe they are communicating directly with each other. Common on unsecured Wi-Fi networks.',
    howItWorks: 'The attacker positions themselves between the victim and the intended destination. On a public Wi-Fi network, the attacker can use tools like ARP spoofing to redirect traffic through their device. They can then read, modify, or inject data into the communication.',
    prevention: [
      'Always use HTTPS websites',
      'Avoid sensitive transactions on public Wi-Fi',
      'Use a VPN on untrusted networks',
      'Verify SSL certificates for anomalies',
    ],
  },
  {
    term: 'SQL Injection',
    category: 'web',
    definition: 'A code injection technique that exploits vulnerabilities in an application\'s database layer. By inserting malicious SQL code into input fields, attackers can manipulate the database — reading, modifying, or deleting data, and sometimes gaining full server access.',
    howItWorks: 'When a web application builds SQL queries by concatenating user input without sanitization, an attacker can inject SQL commands. For example, entering \' OR 1=1 -- in a login field might bypass authentication by making the SQL query always return true.',
    prevention: [
      'Use parameterized queries (prepared statements)',
      'Validate and sanitize all user inputs',
      'Apply the principle of least privilege to database accounts',
      'Use an ORM that handles query escaping automatically',
    ],
  },

  // ── Network & DNS ──
  {
    term: 'DNS (Domain Name System)',
    category: 'network',
    relatedTool: 'Metadata Fetcher',
    definition: 'The internet\'s phone book — DNS translates human-readable domain names (like google.com) into IP addresses (like 142.250.80.46) that computers use to communicate. Every time you visit a website, a DNS lookup happens behind the scenes.',
    howItWorks: 'When you type a URL, your browser asks a DNS resolver for the corresponding IP address. The resolver queries a hierarchy of DNS servers — root servers, TLD servers, and authoritative servers — to find the answer. The result is cached for faster future lookups.',
    prevention: [
      'Use reputable DNS providers (Cloudflare 1.1.1.1, Google 8.8.8.8)',
      'Enable DNS over HTTPS (DoH) for encrypted lookups',
      'Monitor for unauthorized DNS changes',
      'Use DNSSEC to prevent DNS spoofing',
    ],
  },
  {
    term: 'WHOIS',
    category: 'network',
    relatedTool: 'Metadata Fetcher',
    definition: 'A protocol and database system that provides information about registered domain names and IP addresses. WHOIS records include the registrant\'s name, organization, email, registration date, expiration date, and the registrar used.',
    howItWorks: 'When a domain is registered, the registrar collects contact information and publishes it in the WHOIS database. Anyone can query this database to find out who owns a domain. Zentrya\'s Metadata Fetcher uses WHOIS data to identify hosting providers for takedown requests.',
    prevention: [
      'Use WHOIS privacy protection for your domains',
      'Regularly check WHOIS data for unauthorized changes',
      'Use Zentrya\'s Metadata Fetcher to investigate suspicious domains',
      'Monitor domain expiration dates to prevent hijacking',
    ],
  },
  {
    term: 'IP Address',
    category: 'network',
    definition: 'A unique numerical identifier assigned to every device connected to a network. IPv4 addresses look like 192.168.1.1, while IPv6 addresses are longer (2001:0db8:85a3::8a2e:0370:7334). IP addresses are essential for routing internet traffic.',
    howItWorks: 'When you send data over the internet, it\'s broken into packets. Each packet carries the source and destination IP addresses. Routers use these addresses to forward packets along the best path to their destination.',
    prevention: [
      'Use a VPN to mask your real IP address',
      'Be cautious of IP logging on untrusted websites',
      'Configure firewalls to restrict access by IP',
      'Use dynamic IPs or proxy servers for anonymity',
    ],
  },
  {
    term: 'DNS Spoofing (DNS Cache Poisoning)',
    category: 'network',
    definition: 'An attack where corrupted DNS data is injected into a DNS resolver\'s cache, causing the resolver to return an incorrect IP address. This redirects users to malicious websites without their knowledge.',
    howItWorks: 'The attacker sends forged DNS responses to a resolver, associating a legitimate domain name with a malicious IP address. The resolver caches this false record and serves it to all users who query that domain, redirecting them to the attacker\'s server.',
    prevention: [
      'Use DNSSEC to authenticate DNS responses',
      'Use trusted DNS providers',
      'Enable DNS over HTTPS',
      'Clear DNS cache regularly',
    ],
  },

  // ── Malware ──
  {
    term: 'Malware',
    category: 'malware',
    definition: 'Malicious software designed to damage, disrupt, or gain unauthorized access to computer systems. Malware is an umbrella term that includes viruses, worms, trojans, ransomware, spyware, and adware.',
    howItWorks: 'Malware can spread through email attachments, malicious downloads, infected websites, USB drives, or software vulnerabilities. Once installed, it can steal data, encrypt files, spy on users, display ads, or give attackers remote control of the system.',
    prevention: [
      'Keep operating systems and software updated',
      'Use reputable antivirus software',
      'Don\'t download files from untrusted sources',
      'Scan suspicious URLs with Zentrya before visiting',
    ],
  },
  {
    term: 'Ransomware',
    category: 'malware',
    definition: 'A type of malware that encrypts the victim\'s files and demands a ransom payment (usually in cryptocurrency) for the decryption key. Ransomware attacks have caused billions in damages to businesses, hospitals, and governments.',
    howItWorks: 'Ransomware typically enters through phishing emails, malicious downloads, or exploited vulnerabilities. Once executed, it encrypts files on the local system and connected drives. A ransom note is displayed demanding payment. Some variants also steal data and threaten to publish it (double extortion).',
    prevention: [
      'Maintain regular offline backups',
      'Keep all software patched and updated',
      'Train employees to recognize phishing emails',
      'Use network segmentation to limit spread',
    ],
  },
  {
    term: 'Trojan Horse',
    category: 'malware',
    definition: 'Malware disguised as legitimate software. Unlike viruses, trojans don\'t replicate themselves — they rely on tricking users into installing them. Named after the Greek myth, trojans hide malicious functionality inside seemingly useful programs.',
    howItWorks: 'A user downloads what appears to be a legitimate program (a game, utility, or cracked software). The program may function normally, but it also installs hidden malware — a keylogger, backdoor, or remote access tool — that gives the attacker control of the system.',
    prevention: [
      'Only download software from official sources',
      'Verify file hashes when possible',
      'Use antivirus software with real-time scanning',
      'Be wary of free or cracked software',
    ],
  },
  {
    term: 'Keylogger',
    category: 'malware',
    definition: 'A type of surveillance malware that records every keystroke made on a computer or mobile device. Keyloggers capture passwords, credit card numbers, messages, and everything else typed — often without the user\'s knowledge.',
    howItWorks: 'Software keyloggers run as hidden background processes, intercepting keyboard input before it reaches the application. They periodically send logs to the attacker via email or a command-and-control server. Hardware keyloggers are physical devices plugged between the keyboard and computer.',
    prevention: [
      'Use two-factor authentication (keyloggers can\'t capture 2FA codes)',
      'Use password managers with auto-fill (no keystrokes to log)',
      'Keep antivirus updated',
      'Use virtual keyboards for sensitive entries',
    ],
  },
  {
    term: 'Spyware',
    category: 'malware',
    definition: 'Software that secretly monitors user activity and collects personal information without consent. Spyware can track browsing history, capture screenshots, record keystrokes, access webcams, and steal credentials.',
    howItWorks: 'Spyware is often bundled with free software or delivered through malicious websites. It installs silently and runs in the background, collecting data and transmitting it to the attacker. Advanced spyware like Pegasus can infect phones through zero-click exploits.',
    prevention: [
      'Install software only from trusted sources',
      'Review app permissions on mobile devices',
      'Use anti-spyware tools',
      'Keep all devices and software updated',
    ],
  },

  // ── General Security ──
  {
    term: 'Firewall',
    category: 'general',
    definition: 'A network security device or software that monitors and controls incoming and outgoing network traffic based on predetermined security rules. Firewalls act as a barrier between a trusted internal network and untrusted external networks like the internet.',
    howItWorks: 'Firewalls inspect network packets and compare them against a set of rules. They can filter traffic by IP address, port number, protocol, or application. Modern next-generation firewalls (NGFW) also perform deep packet inspection, intrusion prevention, and application-level filtering.',
    prevention: [
      'Enable your operating system\'s built-in firewall',
      'Configure firewall rules to follow least privilege',
      'Use both network and host-based firewalls',
      'Regularly review and update firewall rules',
    ],
  },
  {
    term: 'VPN (Virtual Private Network)',
    category: 'general',
    definition: 'A technology that creates a secure, encrypted tunnel between your device and a VPN server, masking your IP address and encrypting all internet traffic. VPNs protect privacy and security, especially on public Wi-Fi networks.',
    howItWorks: 'When you connect to a VPN, all your internet traffic is encrypted and routed through the VPN server. Websites see the VPN server\'s IP address instead of yours. Your ISP can see you\'re connected to a VPN but can\'t read your traffic.',
    prevention: [
      'Use a VPN on public Wi-Fi networks',
      'Choose a reputable VPN provider with a no-logs policy',
      'Ensure the VPN uses strong encryption (AES-256)',
      'Enable the VPN kill switch to prevent data leaks',
    ],
  },
  {
    term: 'Two-Factor Authentication (2FA)',
    category: 'general',
    definition: 'A security method that requires two different forms of verification before granting access — something you know (password) and something you have (phone, security key) or something you are (fingerprint, face).',
    howItWorks: 'After entering your password, you\'re prompted for a second factor — typically a 6-digit code from an authenticator app, an SMS code, or a biometric scan. Even if an attacker steals your password, they can\'t access your account without the second factor.',
    prevention: [
      'Enable 2FA on all important accounts',
      'Use authenticator apps (Google Authenticator, Authy) over SMS',
      'Keep backup codes in a safe location',
      'Consider hardware security keys (YubiKey) for maximum security',
    ],
  },
  {
    term: 'Zero-Day Vulnerability',
    category: 'general',
    definition: 'A software vulnerability unknown to the vendor and for which no patch exists. Called "zero-day" because developers have had zero days to fix it. These are extremely valuable to attackers and can sell for millions on the black market.',
    howItWorks: 'A researcher or attacker discovers a flaw in software that the developer doesn\'t know about. If exploited before a patch is released, the attack is called a zero-day exploit. Organizations have no defense against the specific vulnerability until a patch is developed and deployed.',
    prevention: [
      'Keep all software updated to the latest versions',
      'Use defense-in-depth strategies (multiple security layers)',
      'Deploy intrusion detection systems',
      'Follow security advisories from vendors',
    ],
  },
  {
    term: 'Brute Force Attack',
    category: 'general',
    definition: 'An attack method that systematically tries every possible combination of characters to guess passwords, encryption keys, or other secrets. While simple in concept, modern computing power makes short or weak passwords vulnerable to brute force.',
    howItWorks: 'The attacker uses automated tools to try thousands or millions of password combinations per second. Variations include dictionary attacks (trying common words), credential stuffing (using stolen password lists), and rainbow table attacks (using precomputed hashes).',
    prevention: [
      'Use long, complex, unique passwords (16+ characters)',
      'Enable account lockout after failed login attempts',
      'Use CAPTCHAs to prevent automated attacks',
      'Implement rate limiting on login endpoints',
    ],
  },
  {
    term: 'DDoS (Distributed Denial of Service)',
    category: 'general',
    definition: 'An attack where multiple compromised systems flood a target server with traffic, overwhelming its resources and making it unavailable to legitimate users. DDoS attacks can take down websites, APIs, and entire networks.',
    howItWorks: 'The attacker controls a botnet — a network of thousands of compromised devices (computers, IoT devices). On command, all devices simultaneously send traffic to the target. The target\'s servers, bandwidth, or infrastructure become overwhelmed and crash or become unresponsive.',
    prevention: [
      'Use DDoS protection services (Cloudflare, AWS Shield)',
      'Implement rate limiting and traffic filtering',
      'Have a DDoS response plan in place',
      'Use content delivery networks (CDNs) to distribute traffic',
    ],
  },
  {
    term: 'Encryption',
    category: 'general',
    definition: 'The process of converting readable data (plaintext) into an unreadable format (ciphertext) using a mathematical algorithm and a key. Only someone with the correct decryption key can convert it back to readable form.',
    howItWorks: 'There are two main types: symmetric encryption (same key for encrypting and decrypting, like AES) and asymmetric encryption (different keys — a public key to encrypt, a private key to decrypt, like RSA). HTTPS uses both: asymmetric for the initial handshake and symmetric for data transfer.',
    prevention: [
      'Use HTTPS for all web communications',
      'Encrypt sensitive data at rest and in transit',
      'Use strong encryption algorithms (AES-256, RSA-2048+)',
      'Manage encryption keys securely',
    ],
  },
];

function TermCard({ item, expanded, onToggle }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden transition-all hover:border-white/20">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <div className="flex-1">
          <h3 className="text-white font-semibold text-lg">{item.term}</h3>
          <p className="text-gray-400 text-sm mt-1 line-clamp-2">{item.definition}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
          {item.relatedTool && (
            <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-400 text-[10px] font-semibold">
              {item.relatedTool}
            </span>
          )}
          {expanded ? (
            <HiOutlineChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <HiOutlineChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">
          <div>
            <h4 className="text-purple-400 text-xs font-semibold uppercase tracking-wider mb-1">How It Works</h4>
            <p className="text-gray-300 text-sm leading-relaxed">{item.howItWorks}</p>
          </div>
          <div>
            <h4 className="text-green-400 text-xs font-semibold uppercase tracking-wider mb-2">Prevention Tips</h4>
            <ul className="space-y-1.5">
              {item.prevention.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                  <span className="text-green-400 mt-0.5">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Glossary() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [expandedTerm, setExpandedTerm] = useState(null);

  const filtered = GLOSSARY_DATA.filter((item) => {
    const matchesSearch =
      !search ||
      item.term.toLowerCase().includes(search.toLowerCase()) ||
      item.definition.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || item.category === category;
    return matchesSearch && matchesCategory;
  });

  const categoryCounts = CATEGORIES.reduce((acc, cat) => {
    acc[cat.id] = cat.id === 'all'
      ? GLOSSARY_DATA.length
      : GLOSSARY_DATA.filter((t) => t.category === cat.id).length;
    return acc;
  }, {});

  return (
    <section id="glossary-section" className="relative min-h-screen">
      <div className="max-w-5xl mx-auto py-16 px-6 relative z-10">

        {/* Header with video */}
        <div className="flex flex-col md:flex-row items-center gap-10 mb-10">
          <div className="md:w-1/2 flex justify-center">
            <div className="w-[16rem] md:w-[20rem] lg:w-[24rem] rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/10 border border-white/5">
              <video
                src={glossaryVideo}
                className="w-full h-auto object-cover pointer-events-none"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-hidden="true"
                tabIndex={-1}
              />
            </div>
          </div>
          <div className="md:w-1/2">
            <p className="text-purple-400 text-sm font-semibold tracking-wider uppercase mb-2">Reference</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-3">Cybersecurity<br />Glossary</h2>
            <p className="text-gray-400 text-base max-w-md mb-5">
              {GLOSSARY_DATA.length} terms covering attack types, defense strategies, and security concepts.
            </p>
            <div className="relative w-full max-w-sm">
              <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search terms..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50"
              />
            </div>
          </div>
        </div>

        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto flex-nowrap no-scrollbar md:flex-wrap md:overflow-visible mb-8 -mx-6 px-6 md:mx-0 md:px-0">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const active = category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition flex-shrink-0 ${
                  active
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20' : 'bg-white/10'}`}>
                  {categoryCounts[cat.id]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Results bar */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-gray-500 text-sm">
            {filtered.length} {filtered.length === 1 ? 'term' : 'terms'} found
            {category !== 'all' && <span className="text-purple-400"> in {CATEGORIES.find(c => c.id === category)?.label}</span>}
          </p>
          {(search || category !== 'all') && (
            <button
              onClick={() => { setSearch(''); setCategory('all'); }}
              className="text-xs text-purple-400 hover:text-purple-300 font-medium transition"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Terms — two column on desktop */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <HiOutlineSearch className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 text-lg">No terms match your search</p>
            <p className="text-gray-600 text-sm mt-1">Try a different keyword or clear filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {filtered.map((item) => (
              <TermCard
                key={item.term}
                item={item}
                expanded={expandedTerm === item.term}
                onToggle={() =>
                  setExpandedTerm(expandedTerm === item.term ? null : item.term)
                }
              />
            ))}
          </div>
        )}

        {/* Bottom info */}
        <div className="mt-12 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-1">Didn't find what you're looking for?</h3>
            <p className="text-gray-400 text-sm">Ask our <span className="text-purple-400 font-semibold">SecBot</span> chatbot — it can explain any cybersecurity concept in simple terms.</p>
          </div>
          <div className="flex gap-4 text-center flex-shrink-0">
            <div className="bg-white/5 rounded-xl px-5 py-3">
              <p className="text-2xl font-bold text-purple-400">{GLOSSARY_DATA.length}</p>
              <p className="text-gray-500 text-xs">Terms</p>
            </div>
            <div className="bg-white/5 rounded-xl px-5 py-3">
              <p className="text-2xl font-bold text-blue-400">{CATEGORIES.length - 1}</p>
              <p className="text-gray-500 text-xs">Categories</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}