# BlackScale Nexus — Hostinger VPS Deployment Checklist

**Domain**: crm.blackscale.consulting  
**Stack**: Next.js 16 · SQLite · Nginx · systemd  
**Auth**: Google Workspace SSO (no passwords)

Work through each section in order. Check off items as you go.

---

## Phase 1 — Before touching the server

- [ ] **Hostinger VPS is provisioned** — Ubuntu 22.04 LTS, minimum 1 vCPU / 2 GB RAM / 20 GB SSD
- [ ] **Root SSH access confirmed** — `ssh root@<VPS_IP>` works
- [ ] **Domain DNS updated** — A record for `crm.blackscale.consulting` → `<VPS_IP>` (wait for propagation, ~5–30 min)
- [ ] **Google OAuth credentials created**
  - Go to console.cloud.google.com → APIs & Services → Credentials → Create OAuth 2.0 Client
  - Application type: **Web application**
  - Authorized redirect URIs:
    - `https://crm.blackscale.consulting/api/auth/callback/google`
    - `https://crm.blackscale.consulting/api/auth/callback/google-calendar`
  - Save `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- [ ] **Secrets generated locally**
  ```bash
  openssl rand -base64 32   # → NEXTAUTH_SECRET
  openssl rand -hex 32      # → ENCRYPTION_KEY
  ```
- [ ] **`.env.production` file prepared** (copy from `.env.example`, fill in all required values)

### Minimum required env vars
```
NEXT_PUBLIC_APP_URL=https://crm.blackscale.consulting
NEXTAUTH_URL=https://crm.blackscale.consulting
NEXTAUTH_SECRET=<generated above>
GOOGLE_CLIENT_ID=<from Google Console>
GOOGLE_CLIENT_SECRET=<from Google Console>
ENCRYPTION_KEY=<generated above>
NODE_ENV=production
```

---

## Phase 2 — Server provisioning (run as root)

Follow `scripts/vps-setup.sh` block by block — do NOT run it all at once.

- [ ] **System updated**
  ```bash
  apt-get update -y && apt-get upgrade -y
  apt-get install -y curl git build-essential ufw fail2ban certbot python3-certbot-nginx
  ```
- [ ] **Deployment user created**
  ```bash
  adduser daniel --gecos "" --disabled-password
  echo "daniel:<STRONG_PASSWORD>" | chpasswd
  usermod -aG sudo daniel
  ```
- [ ] **SSH key uploaded** (from your local machine)
  ```bash
  ssh-copy-id -i ~/.ssh/id_ed25519.pub daniel@<VPS_IP>
  ```
- [ ] **SSH hardened** — password auth disabled, root login disabled (see `scripts/vps-setup.sh` step 3)
- [ ] **Firewall enabled**
  ```bash
  ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp
  ufw --force enable
  ```
- [ ] **fail2ban configured and running**

---

## Phase 3 — App installation (run as daniel)

```bash
su - daniel
```

- [ ] **Node.js 22 installed via nvm**
  ```bash
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  source ~/.bashrc
  nvm install 22 && nvm use 22
  node --version  # should print v22.x.x
  ```
- [ ] **Repository cloned**
  ```bash
  git clone https://github.com/daniel666674/blackscalenexus.git /opt/nexus
  cd /opt/nexus
  ```
- [ ] **`.env.production` uploaded**
  ```bash
  # From your local machine:
  scp .env.production daniel@<VPS_IP>:/opt/nexus/.env.production
  chmod 600 /opt/nexus/.env.production
  ```
- [ ] **Dependencies installed**
  ```bash
  cd /opt/nexus && npm install --production
  ```
- [ ] **Database initialized**
  ```bash
  npm run init
  ```
- [ ] **Roles seeded**
  ```bash
  npx tsx scripts/seed-roles.ts
  ```
- [ ] **App built**
  ```bash
  npm run build
  ```
- [ ] **Encryption verified** (requires SQLCipher — see note below)
  ```bash
  node scripts/verify-encryption.js
  # Expected: "OK: Database is encrypted. SQLCipher is active."
  ```

> **SQLCipher note**: If verify-encryption fails, rebuild better-sqlite3 with SQLCipher:
> `npm rebuild better-sqlite3 --build-from-source`
> You may need `apt-get install -y libsqlcipher-dev` first.

---

## Phase 4 — systemd service (run as root)

- [ ] **Service file installed** — copy from `scripts/vps-setup.sh` step 7
- [ ] **Service enabled and started**
  ```bash
  systemctl daemon-reload
  systemctl enable nexus
  systemctl start nexus
  systemctl status nexus  # should show "active (running)"
  ```
- [ ] **App is reachable on port 3000 locally**
  ```bash
  curl -I http://localhost:3000
  # Expected: HTTP/1.1 200 or 307 redirect to /login
  ```

---

## Phase 5 — Nginx + SSL (run as root)

- [ ] **Nginx config installed**
  ```bash
  cp /opt/nexus/config/nginx.conf /etc/nginx/sites-available/nexus
  ln -sf /etc/nginx/sites-available/nexus /etc/nginx/sites-enabled/nexus
  rm -f /etc/nginx/sites-enabled/default
  nginx -t  # must say "syntax is ok"
  systemctl reload nginx
  ```
- [ ] **SSL certificate issued**
  ```bash
  certbot --nginx -d crm.blackscale.consulting \
    --non-interactive --agree-tos \
    -m daniel.acosta@blackscale.consulting
  ```
- [ ] **Certbot renewal timer active**
  ```bash
  systemctl status certbot.timer  # should be active
  ```
- [ ] **HTTPS works** — visit `https://crm.blackscale.consulting` in browser

---

## Phase 6 — Smoke test

- [ ] **Login page loads** at `https://crm.blackscale.consulting/login`
- [ ] **Google SSO login works** — authenticates with a `@blackscale.consulting` Google account
- [ ] **Dashboard accessible** after login
- [ ] **Contacts, Deals, Pipeline pages load** without errors
- [ ] **No HTTP Mixed Content warnings** in browser console
- [ ] **Security headers grade** — check at securityheaders.com (target: A or A+)

---

## Phase 7 — Backup

- [ ] **Backup script is executable**
  ```bash
  chmod +x /opt/nexus/scripts/nexus-backup.sh
  mkdir -p /var/backups/nexus/daily
  ```
- [ ] **Cron job installed** (run as root)
  ```bash
  (crontab -l 2>/dev/null; echo "0 2 * * * /opt/nexus/scripts/nexus-backup.sh") | crontab -
  crontab -l  # verify it's there
  ```
- [ ] **Test backup runs without errors**
  ```bash
  /opt/nexus/scripts/nexus-backup.sh
  ls /var/backups/nexus/daily/
  ```

---

## Optional extras

- [ ] **Brevo email integration** — set `BREVO_API_KEY` in `.env.production`, restart service
- [ ] **Resend digest** — set `RESEND_API_KEY` + `DIGEST_EMAIL`, test with `/digest` command
- [ ] **VAPID push notifications** — generate keys with `npx web-push generate-vapid-keys`, add to env
- [ ] **GA4 analytics** — set `GA4_PROPERTY_ID` + `GA4_CREDENTIALS` in env
- [ ] **Anthropic API** — set `ANTHROPIC_API_KEY` for inline AI lead classification

---

## Quick-reference commands (on the VPS)

```bash
# App status
systemctl status nexus

# View logs
journalctl -u nexus -f

# Restart app
systemctl restart nexus

# Deploy new version
cd /opt/nexus && git pull && npm install && npm run build && systemctl restart nexus

# Manual backup
/opt/nexus/scripts/nexus-backup.sh

# Nginx logs
tail -f /var/log/nginx/nexus-error.log
```
