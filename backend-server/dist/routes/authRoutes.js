"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const models_1 = require("../models");
const crypto_1 = __importDefault(require("crypto"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const sequelize_1 = require("sequelize");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_super_secret_key';
// REGISTER API
router.post('/register', async (req, res) => {
    try {
        const { email, password, fullName, displayName, phoneNumber, companyName, city, state, userType } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        // Check if user already exists
        const existingUser = await models_1.User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }
        // Hash password
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        // Create new user in MySQL
        const user = await models_1.User.create({
            email,
            password: hashedPassword,
            displayName: fullName || displayName,
            phoneNumber,
            companyName,
            city,
            state,
            userType
        });
        // Generate JWT Token
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
            expiresIn: '7d',
        });
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user.id,
                email: user.email,
                displayName: user.displayName,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error during registration' });
    }
});
// LOGIN API
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        // Find user in MySQL
        const user = await models_1.User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        // Compare passwords
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        // Generate JWT Token
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
            expiresIn: '7d',
        });
        res.status(200).json({
            message: 'Logged in successfully',
            token,
            user: {
                id: user.id,
                email: user.email,
                displayName: user.displayName,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error during login' });
    }
});
// GET CURRENT USER API (using token)
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await models_1.User.findByPk(decoded.id, {
            attributes: { exclude: ['password'] } // Don't send password hash back
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ user });
    }
    catch (error) {
        console.error('Fetch user error:', error);
        res.status(401).json({ error: 'Invalid or expired token' });
    }
});
let transporter = null;
const getTransporter = async () => {
    if (transporter)
        return transporter;
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        console.log('📬 Configuring custom SMTP mail transporter...');
        transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        return transporter;
    }
    console.warn('⚠️ No SMTP credentials found in .env. Creating a temporary Ethereal mail test account...');
    const testAccount = await nodemailer_1.default.createTestAccount();
    console.log(`✉️ Ethereal Email Account created: user: ${testAccount.user}, pass: ${testAccount.pass}`);
    transporter = nodemailer_1.default.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });
    return transporter;
};
// HTML page templates
const getResetPasswordHTML = (token) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Password - MachineXchange</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Outfit', sans-serif;
      background: linear-gradient(135deg, #0d0d0d 0%, #171717 100%);
      color: #ffffff;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      background: rgba(255, 255, 255, 0.02);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(212, 175, 55, 0.2);
      border-radius: 20px;
      padding: 45px 35px;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      text-align: center;
    }
    .logo {
      color: #d4af37;
      font-size: 34px;
      font-weight: 700;
      margin-bottom: 8px;
      letter-spacing: 1.5px;
      text-shadow: 0 0 15px rgba(212, 175, 55, 0.25);
    }
    .subtitle {
      color: #a3a3a3;
      font-size: 14px;
      margin-bottom: 35px;
      line-height: 1.5;
    }
    .form-group {
      text-align: left;
      margin-bottom: 24px;
      position: relative;
    }
    label {
      display: block;
      color: #d4af37;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: 8px;
      letter-spacing: 1px;
    }
    input {
      width: 100%;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      padding: 14px 18px;
      font-size: 16px;
      color: #ffffff;
      font-family: inherit;
      outline: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    input:focus {
      border-color: #d4af37;
      background: rgba(255, 255, 255, 0.07);
      box-shadow: 0 0 12px rgba(212, 175, 55, 0.2);
    }
    .error-msg {
      color: #f87171;
      font-size: 13px;
      margin-top: 6px;
      display: none;
      font-weight: 500;
    }
    .btn {
      width: 100%;
      background: linear-gradient(90deg, #d4af37 0%, #b8972e 100%);
      color: #000000;
      border: none;
      border-radius: 10px;
      padding: 15px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      margin-top: 10px;
      box-shadow: 0 4px 20px rgba(212, 175, 55, 0.25);
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(212, 175, 55, 0.35);
    }
    .btn:active {
      transform: translateY(0);
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">MachineXchange</div>
    <div class="subtitle">Update your credentials to regain account access.</div>
    <form id="resetForm" method="POST" action="/api/auth/reset-password">
      <input type="hidden" name="token" value="${token}">
      
      <div class="form-group">
        <label for="password">New Password</label>
        <input type="password" id="password" name="password" required minlength="6" placeholder="At least 6 characters">
      </div>
      
      <div class="form-group">
        <label for="confirmPassword">Confirm Password</label>
        <input type="password" id="confirmPassword" required placeholder="Re-enter password">
        <div id="error" class="error-msg">Passwords do not match</div>
      </div>
      
      <button type="submit" class="btn">Reset Password</button>
    </form>
  </div>
  
  <script>
    const form = document.getElementById('resetForm');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const error = document.getElementById('error');
    
    form.addEventListener('submit', (e) => {
      if (password.value !== confirmPassword.value) {
        e.preventDefault();
        error.style.display = 'block';
      } else {
        error.style.display = 'none';
      }
    });
    
    confirmPassword.addEventListener('input', () => {
      if (password.value === confirmPassword.value) {
        error.style.display = 'none';
      }
    });
  </script>
</body>
</html>
`;
const getExpiredHTML = () => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Link Expired - MachineXchange</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Outfit', sans-serif;
      background: linear-gradient(135deg, #0d0d0d 0%, #171717 100%);
      color: #ffffff;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      margin: 0;
    }
    .card {
      background: rgba(255, 255, 255, 0.02);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 20px;
      padding: 45px 35px;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      text-align: center;
    }
    .logo {
      color: #ef4444;
      font-size: 34px;
      font-weight: 700;
      margin-bottom: 15px;
      letter-spacing: 1px;
    }
    .subtitle {
      color: #a3a3a3;
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    .btn {
      display: inline-block;
      text-decoration: none;
      background: rgba(255, 255, 255, 0.06);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 10px;
      padding: 14px 28px;
      font-size: 15px;
      font-weight: 600;
      transition: all 0.3s ease;
      cursor: pointer;
    }
    .btn:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: #d4af37;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">Link Expired</div>
    <div class="subtitle">This password reset link is invalid or has expired. Please request a new password reset link from the mobile app.</div>
    <button class="btn" onclick="window.close()">Close Window</button>
  </div>
</body>
</html>
`;
const getSuccessHTML = () => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Success - MachineXchange</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Outfit', sans-serif;
      background: linear-gradient(135deg, #0d0d0d 0%, #171717 100%);
      color: #ffffff;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      margin: 0;
    }
    .card {
      background: rgba(255, 255, 255, 0.02);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(34, 197, 94, 0.2);
      border-radius: 20px;
      padding: 50px 35px;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      text-align: center;
    }
    .icon {
      font-size: 60px;
      color: #22c55e;
      margin-bottom: 20px;
    }
    .title {
      color: #22c55e;
      font-size: 30px;
      font-weight: 700;
      margin-bottom: 12px;
      letter-spacing: 0.5px;
    }
    .subtitle {
      color: #d4d4d4;
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    .btn {
      display: inline-block;
      text-decoration: none;
      background: rgba(255, 255, 255, 0.06);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 10px;
      padding: 14px 28px;
      font-size: 15px;
      font-weight: 600;
      transition: all 0.3s ease;
      cursor: pointer;
    }
    .btn:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: #d4af37;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✓</div>
    <div class="title">Success!</div>
    <div class="subtitle">Your password has been reset successfully. You can now close this tab, open the MachineXchange mobile app, and log in with your new password.</div>
    <button class="btn" onclick="window.close()">Close Window</button>
  </div>
</body>
</html>
`;
// FORGOT PASSWORD API
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        // Check if user exists
        const user = await models_1.User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'No user found with this email' });
        }
        // Generate secure token and expiry time (1 hour from now)
        const token = crypto_1.default.randomBytes(20).toString('hex');
        const expires = new Date(Date.now() + 3600000);
        user.resetPasswordToken = token;
        user.resetPasswordExpires = expires;
        await user.save();
        // Prepare reset email
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const backendUrl = process.env.BACKEND_URL || `${protocol}://${req.get('host')}`;
        const resetLink = `${backendUrl}/api/auth/reset-password?token=${token}`;
        const mailTransporter = await getTransporter();
        const mailOptions = {
            from: `"MachineXchange Support" <${process.env.SMTP_USER || 'no-reply@machinexchange.com'}>`,
            to: user.email,
            subject: 'MachineXchange Password Reset Request',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f7f9fc; margin: 0; padding: 0; color: #333333; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }
            .header { background-color: #1a1a1a; padding: 30px; text-align: center; }
            .header h1 { color: #d4af37; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; white-space: nowrap; }
            .content { padding: 40px 30px; line-height: 1.6; }
            .content h2 { font-size: 20px; color: #111111; margin-top: 0; }
            .btn-container { text-align: center; margin: 30px 0; }
            .btn { background-color: #d4af37; color: #ffffff !important; text-decoration: none; padding: 14px 28px; font-weight: bold; border-radius: 4px; display: inline-block; box-shadow: 0 4px 6px rgba(212, 175, 55, 0.2); }
            .footer { background-color: #f1f3f6; padding: 20px; text-align: center; font-size: 12px; color: #777777; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header"><h1>MachineXchange</h1></div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>Hello,</p>
              <p>You are receiving this email because you (or someone else) requested a password reset for your MachineXchange account.</p>
              <p>Please click the button below to complete the process within the next hour:</p>
              <div class="btn-container">
                <a href="${resetLink}" class="btn">Reset Password</a>
              </div>
              <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply directly to this message.</p>
              <p>&copy; ${new Date().getFullYear()} MachineXchange. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
        };
        const info = await mailTransporter.sendMail(mailOptions);
        console.log(`✉️ Password reset email sent to ${user.email}. Message ID: ${info.messageId}`);
        if (!process.env.SMTP_USER) {
            const previewUrl = nodemailer_1.default.getTestMessageUrl(info);
            console.log(`📬 Ethereal Mail Preview URL: ${previewUrl}`);
        }
        res.status(200).json({ message: 'Password reset link sent to your email' });
    }
    catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Internal server error during password reset request' });
    }
});
// GET RESET PASSWORD PAGE
router.get('/reset-password', async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) {
            return res.status(400).send(getExpiredHTML());
        }
        const user = await models_1.User.findOne({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: {
                    [sequelize_1.Op.gt]: new Date()
                }
            }
        });
        if (!user) {
            return res.status(400).send(getExpiredHTML());
        }
        res.status(200).send(getResetPasswordHTML(token));
    }
    catch (error) {
        console.error('Render reset page error:', error);
        res.status(500).send(getExpiredHTML());
    }
});
// POST RESET PASSWORD ACTION
router.post('/reset-password', express_1.default.urlencoded({ extended: true }), async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).send(getExpiredHTML());
        }
        const user = await models_1.User.findOne({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: {
                    [sequelize_1.Op.gt]: new Date()
                }
            }
        });
        if (!user) {
            return res.status(400).send(getExpiredHTML());
        }
        // Hash the new password
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        // Save and clear tokens
        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();
        console.log(`✅ Password successfully reset for user ${user.email}`);
        res.status(200).send(getSuccessHTML());
    }
    catch (error) {
        console.error('Reset password post error:', error);
        res.status(500).send(getExpiredHTML());
    }
});
exports.default = router;
