# Cloudflare Zero Trust Deployment Guide: Tibule Control Tower

This guide provides the exact zero-cost configuration steps to lock down **Tibule Control Tower** so it is completely invisible to search engines and public web crawlers, and strictly accessible only to team members with `@tibule.com` or `@afriqintel.com` email addresses via Cloudflare Email OTP (One-Time PIN).

---

## 1. Zero Trust Architecture Summary

* **Public Internet Exposure**: None. All incoming web requests are intercepted by Cloudflare edge servers before reaching the container.
* **Authentication Method**: Cloudflare One-Time PIN (OTP).
* **Allowed Identity Domains**:
  - `*@tibule.com`
  - `*@afriqintel.com`
* **Cost**: **$0.00 / month** on the Cloudflare Zero Trust Free Tier (supports up to 50 active users).
* **Search Engine Shielding**:
  - Web crawlers (Google, Bing, Yandex, Baidu) receive a `403 Forbidden` or Cloudflare Access Challenge screen.
  - In-app `robots.txt` (`Disallow: /`) and `<meta name="robots" content="noindex, nofollow, noarchive" />` block all indexing.

---

## 2. Step-by-Step Cloudflare Zero Trust Setup

### Step 1: Access the Cloudflare Zero Trust Dashboard
1. Log in to [dash.cloudflare.com](https://dash.cloudflare.com).
2. In the left navigation, click **Zero Trust**.
3. Select your team name (or choose a free subdomain such as `tibule.cloudflareaccess.com`).
4. Ensure the **Free Plan** is selected (up to 50 seats).

### Step 2: Enable One-Time PIN (OTP) Authentication
1. Go to **Zero Trust** $\rightarrow$ **Settings** $\rightarrow$ **Authentication**.
2. Under **Login methods**, verify that **One-time PIN** is enabled (it is on by default).
3. (Optional) Under **Customization**, you can upload the Tibule logo and set your brand color.

### Step 3: Create an Access Application
1. In the Zero Trust dashboard, go to **Access** $\rightarrow$ **Applications**.
2. Click **Add an application** $\rightarrow$ Select **Self-hosted**.
3. Fill in the application details:
   - **Application name**: `Tibule Control Tower`
   - **Session Duration**: `24 Hours` (or `7 Days` for convenience)
   - **Application domain**:
     - Subdomain: `tower` (or `ops` / `controltower`)
     - Domain: `tibule.com` (or your registered domain)
     - Path: leave blank (covers all routes `/*`)
4. Click **Next**.

### Step 4: Configure the Corporate Email Policy
1. Set **Policy name**: `Allow Tibule and AfriqIntel Staff`
2. **Action**: `Allow`
3. Under **Configure rules** $\rightarrow$ **Include**:
   - **Selector**: `Emails ending in`
   - **Value**: `@tibule.com`
4. Click **+ Add include rule**:
   - **Selector**: `Emails ending in`
   - **Value**: `@afriqintel.com`
5. Leave require/exclude empty.
6. Click **Next** $\rightarrow$ Click **Save application**.

---

## 3. Connecting to the Application Container (Cloudflare Tunnel)

To connect your Cloud Run container or web server to Cloudflare without opening public firewall ports:

### Method A: Cloudflare Dashboard (GUI Tunnel - Recommended)
1. Go to **Zero Trust** $\rightarrow$ **Networks** $\rightarrow$ **Tunnels**.
2. Click **Create a tunnel** $\rightarrow$ Name it `tibule-control-tower-tunnel`.
3. Choose your connector environment (Docker / Linux).
4. Under **Public Hostname**:
   - Subdomain: `tower`
   - Domain: `tibule.com`
   - Service Type: `HTTP`
   - URL: `localhost:3000` (or your internal container URL)
5. Save the tunnel. Traffic to `https://tower.tibule.com` will now securely proxy to your container.

### Method B: Cloudflare CLI (`cloudflared`)
Run the following in your container or server:
```bash
# 1. Install cloudflared
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
dpkg -i cloudflared.deb

# 2. Authenticate
cloudflared tunnel login

# 3. Create tunnel
cloudflared tunnel create tibule-tower

# 4. Route traffic
cloudflared tunnel route dns tibule-tower tower.tibule.com

# 5. Run tunnel
cloudflared tunnel run --url http://localhost:3000 tibule-tower
```

---

## 4. In-App Defense-in-Depth Protection

Even before Cloudflare Access is hooked up, the application has built-in protections:
1. **Robots Exclusion**: `public/robots.txt` disallows all crawlers.
2. **Meta Tag Shielding**: `<meta name="robots" content="noindex, nofollow, noarchive" />` in `index.html`.
3. **Domain Verification**: Both registration and email OTP authentication validate that all emails end with `@tibule.com` or `@afriqintel.com`.
4. **Session Persistence**: Validated staff sessions are saved locally so users remain logged in throughout their shift.
