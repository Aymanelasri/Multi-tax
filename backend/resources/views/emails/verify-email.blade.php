<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - SIMPL-TVA</title>
    <style type="text/css">
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #1a1a2e;
            color: #333;
            line-height: 1.6;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #1a1a2e;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .email-card {
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }

        .email-header {
            background: linear-gradient(135deg, #00c896 0%, #009d7a 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }

        .email-header h1 {
            font-size: 28px;
            font-weight: 700;
            margin: 0;
            letter-spacing: -0.5px;
        }

        .email-header p {
            font-size: 14px;
            margin-top: 8px;
            opacity: 0.95;
        }

        .email-content {
            padding: 40px 30px;
        }

        .email-content h2 {
            font-size: 22px;
            color: #1a1a2e;
            margin-bottom: 16px;
            font-weight: 600;
        }

        .greeting {
            font-size: 16px;
            color: #333;
            margin-bottom: 20px;
        }

        .greeting strong {
            color: #00c896;
        }

        .description {
            font-size: 14px;
            color: #666;
            line-height: 1.8;
            margin-bottom: 30px;
        }

        .button-container {
            text-align: center;
            margin: 30px 0;
        }

        .verify-button {
            display: inline-block;
            background: linear-gradient(135deg, #00c896 0%, #009d7a 100%);
            color: white;
            padding: 14px 40px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 200, 150, 0.3);
            border: none;
            cursor: pointer;
        }

        .verify-button:hover {
            background: linear-gradient(135deg, #009d7a 0%, #007a5f 100%);
            box-shadow: 0 6px 20px rgba(0, 200, 150, 0.4);
            text-decoration: none;
        }

        .verified-text {
            font-size: 13px;
            color: #999;
            margin-top: 15px;
        }

        .verified-text a {
            color: #00c896;
            text-decoration: none;
            font-weight: 600;
        }

        .verified-text a:hover {
            text-decoration: underline;
        }

        .expiry-note {
            background-color: #f5f5f5;
            border-left: 4px solid #00c896;
            padding: 16px;
            margin: 25px 0;
            border-radius: 4px;
            font-size: 13px;
            color: #666;
        }

        .email-footer {
            background-color: #f8f8f8;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #eee;
        }

        .footer-text {
            font-size: 12px;
            color: #999;
            margin-bottom: 15px;
        }

        .footer-links {
            font-size: 12px;
            margin-bottom: 15px;
        }

        .footer-links a {
            color: #00c896;
            text-decoration: none;
            margin: 0 12px;
        }

        .footer-links a:hover {
            text-decoration: underline;
        }

        .copyright {
            font-size: 11px;
            color: #bbb;
            margin-top: 15px;
            border-top: 1px solid #eee;
            padding-top: 15px;
        }

        @media only screen and (max-width: 600px) {
            .container {
                padding: 10px;
            }

            .email-card {
                border-radius: 8px;
            }

            .email-header {
                padding: 30px 20px;
            }

            .email-header h1 {
                font-size: 24px;
            }

            .email-content {
                padding: 25px 20px;
            }

            .email-content h2 {
                font-size: 18px;
            }

            .email-footer {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="email-card">
            <!-- Header -->
            <div class="email-header">
                <h1>SIMPL-TVA</h1>
                <p>Gestion Fiscale Simplifiée</p>
            </div>

            <!-- Content -->
            <div class="email-content">
                <h2>Verify Your Email Address</h2>

                <p class="greeting">
                    Hello <strong>{{ $user->name }}</strong>,
                </p>

                <p class="description">
                    Welcome to SIMPL-TVA! To complete your registration and get started, please verify your email address by clicking the button below.
                </p>

                <div class="button-container">
                    <a href="{{ $verificationUrl }}" class="verify-button">Verify Email Address</a>
                </div>

                <div class="expiry-note">
                    <strong>⏱️ Link Expires</strong><br>
                    This verification link will expire in 24 hours. If it expires, you can request a new one from your account.
                </div>

                <p class="description">
                    If you didn't create this account, please disregard this email.
                </p>
            </div>

            <!-- Footer -->
            <div class="email-footer">
                <div class="footer-links">
                    <a href="https://multitax.netlify.app">Visit Website</a>
                    <a href="https://multitax.netlify.app/support">Support</a>
                    <a href="https://multitax.netlify.app/privacy">Privacy</a>
                </div>

                <div class="footer-text">
                    SIMPL-TVA Tax Management Platform
                </div>

                <div class="copyright">
                    &copy; {{ date('Y') }} SIMPL-TVA. All rights reserved.
                </div>
            </div>
        </div>
    </div>
</body>
</html>
