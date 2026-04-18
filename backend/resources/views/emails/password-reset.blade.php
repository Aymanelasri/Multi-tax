<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Réinitialisation de mot de passe - SIMPL-TVA</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 0;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #0a0f1a 0%, #1a2236 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .logo {
            display: inline-flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
        }
        .logo-badge {
            width: 40px;
            height: 40px;
            background: #00d4a0;
            color: #0a0f1a;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 900;
            font-size: 16px;
            border-radius: 10px;
        }
        .logo-text {
            font-size: 24px;
            font-weight: 800;
        }
        .logo-simpl {
            color: white;
        }
        .logo-tva {
            color: #00d4a0;
        }
        .content {
            padding: 40px 30px;
        }
        .title {
            font-size: 24px;
            font-weight: 700;
            color: #0a0f1a;
            margin-bottom: 20px;
            text-align: center;
        }
        .message {
            font-size: 16px;
            line-height: 1.6;
            color: #555;
            margin-bottom: 30px;
        }
        .button {
            display: inline-block;
            background: #00d4a0;
            color: #0a0f1a;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 700;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            font-size: 14px;
            color: #666;
            border-radius: 0 0 10px 10px;
        }
        .security-note {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
            color: #856404;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <div class="logo-badge">ST</div>
                <span class="logo-text">
                    <span class="logo-simpl">SIMPL-</span>
                    <span class="logo-tva">TVA</span>
                </span>
            </div>
            <h1 style="margin: 0; font-size: 20px; font-weight: 600;">Réinitialisation de mot de passe</h1>
        </div>
        
        <div class="content">
            <h2 class="title">🔑 Réinitialisez votre mot de passe</h2>
            
            <div class="message">
                <p>Bonjour,</p>
                <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte SIMPL-TVA.</p>
                <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
            </div>
            
            <div class="button-container">
                <a href="{{ $url }}" class="button">Réinitialiser mon mot de passe</a>
            </div>
            
            <div class="security-note">
                <strong>🛡️ Note de sécurité :</strong><br>
                Ce lien expire dans 60 minutes pour votre sécurité. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
            </div>
            
            <div class="message">
                <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
                <p style="word-break: break-all; color: #00d4a0; font-family: monospace;">{{ $url }}</p>
            </div>
        </div>
        
        <div class="footer">
            <p>Cet email a été envoyé par SIMPL-TVA</p>
            <p>Si vous avez des questions, contactez notre support.</p>
        </div>
    </div>
</body>
</html>