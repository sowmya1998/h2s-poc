# Omnistream AI Security Protocol

Omnistream AI is engineered with a **Security-First** mindset, specifically designed for high-stress disaster response environments where data integrity and user safety are paramount.

## 🛡️ Core Security Architecture

### 1. Zero-Day XSS Prevention
We utilize **DOMPurify** to sanitize every piece of content before it enters the DOM. 
- All AI-generated HTML is scrubbed of malicious scripts or event handlers.
- Multi-layered sanitization occurs at both the service layer and the view layer.

### 2. Rigorous Content Security Policy (CSP)
Our `index.html` implements a strict CSP header that restricts the application's environment to trusted endpoints only:
- **`connect-src`**: Strictly limited to `google.googleapis.com` for Gemini AI and Google Maps.
- **`script-src`**: Only allows our own scripts and the official Google Maps SDK. 
- **`style-src`**: Restricts styling to internal CSS and Google Fonts.

### 3. Environment Protection
- **Secrets Isolation**: API Keys are never hardcoded. They are managed via GitHub Secrets and local `.env` files, injected at build time.
- **Production Isolation**: The production build uses `vite build`, which minifies and obfuscates logic, making reverse-engineering difficult.

### 4. Data Privacy
- Omnistream AI does not persist user data in a database. 
- It acts as a **stateless triage hub**, meaning sensitive emergency data is processed in-memory and cleared upon session refresh.

## 🚦 Incident Response
In the event of a suspected security breach, deployment can be instantly rolled back using GitHub Actions, and API keys can be rotated via Google Cloud Console without requiring a code change.
