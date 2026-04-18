# 🚀 Book & Vibe - Full Stack Local Setup with ngrok

Quick start guide to run all services locally and expose them to the internet via ngrok.

## 📋 Prerequisites

### 1. Node.js (Required)
- Download from: https://nodejs.org/
- Verify installation: `node --version` and `npm --version`

### 2. ngrok (Required for internet sharing)
- Download from: https://ngrok.com/download
- Unzip and add to PATH, or
- Install via Chocolatey: `choco install ngrok`
- Verify installation: `ngrok --version`

### 3. Create ngrok Account (Free)
- Sign up at: https://dashboard.ngrok.com/signup
- Get your auth token
- Run: `ngrok config add-authtoken <YOUR_TOKEN>`

## 🚀 Quick Start

### Option 1: Using PowerShell Script (Recommended)
```powershell
cd "c:\Users\harih\Downloads\book and vibe"
.\run-all.ps1
```

### Option 2: Using Batch Script
```cmd
cd "c:\Users\harih\Downloads\book and vibe"
run-all.bat
```

### Option 3: Manual Setup (Individual Services)

#### Terminal 1 - Backend
```powershell
cd "c:\Users\harih\Downloads\book and vibe\backend"
npm install
npm run dev
```
Backend runs on: `http://localhost:5000`

#### Terminal 2 - Web App
```powershell
cd "c:\Users\harih\Downloads\book and vibe\web-app"
npm install
npm run dev
```
Web App runs on: `http://localhost:3000`

#### Terminal 3 - Admin Dashboard
```powershell
cd "c:\Users\harih\Downloads\book and vibe\admin-dashboard"
npm install
npm run dev
```
Admin Dashboard runs on: `http://localhost:3001`

#### Terminal 4+ - ngrok Tunnels (Optional)
```powershell
# Terminal 4
ngrok http 5000  # Backend tunnel

# Terminal 5
ngrok http 3000  # Web App tunnel

# Terminal 6
ngrok http 3001  # Admin Dashboard tunnel
```

## 📍 Access Points

### Local (Your Machine)
| Service | URL | Port |
|---------|-----|------|
| Backend API | http://localhost:5000 | 5000 |
| Web App | http://localhost:3000 | 3000 |
| Admin Dashboard | http://localhost:3001 | 3001 |

### Internet (via ngrok - Share with Friends)
After running ngrok tunnels, you'll see output like:
```
Session Status                online
Account                       your-email@example.com
Version                       3.5.0
Region                        us (United States)
Latency                       45ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc12345-67890.ngrok.io -> localhost:5000
```

Share these URLs with your friend:
- **Backend**: `https://abc12345-67890.ngrok.io`
- **Web App**: `https://xyz98765-43210.ngrok.io`
- **Admin Dashboard**: `https://def54321-09876.ngrok.io`

## 🛠️ Troubleshooting

### "ngrok: command not found"
- Install ngrok: https://ngrok.com/download
- Or add ngrok to PATH environment variable

### "npm: command not found"
- Install Node.js from https://nodejs.org/

### "Port already in use"
- Kill the process using the port:
```powershell
# For port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Backend not connecting to database
- Check `.env` file in backend directory
- Ensure database is running and accessible
- Check environment variables are set correctly

### ngrok keeps disconnecting
- Check your internet connection
- Verify ngrok auth token is set: `ngrok config add-authtoken <TOKEN>`
- ngrok free tier has time limits; consider upgrading for stability

## 📱 Environment Variables

### Backend (.env)
Key variables to check:
- `PORT=5000`
- `DATABASE_URL` - Your database connection string
- `SOCKET_CORS_ORIGIN` - Should allow your frontend URLs

### Frontend Apps (.env.local or .env)
Key variables to check:
- `NEXT_PUBLIC_API_URL` - Should point to backend (local or ngrok URL)

## 🔗 Connecting Frontend to Backend

### Local Development
In web-app and admin-dashboard, set API URL to:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Using ngrok URLs
Update API URLs to:
```
NEXT_PUBLIC_API_URL=https://your-ngrok-backend-url
```

## 📊 ngrok Web Dashboard

Monitor all tunnels in real-time:
```
http://127.0.0.1:4040
```

Features:
- View all requests in real-time
- Inspect request/response headers
- Test endpoints manually
- Monitor traffic

## 💡 Tips

1. **Use consistent ports**: Don't change default ports unless necessary
2. **Keep ngrok running**: Don't close ngrok terminals while sharing links
3. **Monitor logs**: Keep terminal windows visible to debug issues
4. **Test locally first**: Ensure everything works on localhost before sharing ngrok URLs
5. **Use ngrok's web dashboard**: Great for debugging requests

## 🎯 Common Tasks

### Check running processes
```powershell
Get-Job
```

### Stop all services
```powershell
Get-Job | Stop-Job
```

### View backend logs
```powershell
# Last 50 lines
Get-Job -Name "Backend" | Receive-Job
```

### Restart a single service
```powershell
# Stop backend
Get-Job -Name "Backend" | Stop-Job

# Start backend again
cd "c:\Users\harih\Downloads\book and vibe\backend"
npm run dev
```

## 🆘 Support

If services fail to start:
1. Check Node.js version: `node --version` (should be 16+)
2. Clear npm cache: `npm cache clean --force`
3. Delete node_modules and reinstall: `rm -r node_modules` then `npm install`
4. Check for port conflicts: `netstat -ano`

---

**Happy coding! 🎉**
