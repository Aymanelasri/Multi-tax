<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Mail;

class SendVerificationEmail extends Notification
{

    public $verification_token;
    public $email;
    public $name;

    /**
     * Create a new notification instance.
     */
    public function __construct()
    {
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Send the notification via email.
     * This method handles both User objects and temporary objects.
     */
    public function send($notifiable)
    {
        // Handle both actual User objects and temporary objects from AuthController
        $email = $notifiable->email ?? $notifiable->email;
        $name = $notifiable->name ?? $notifiable->name;
        $token = $notifiable->verification_token ?? null;

        if (!$token) {
            return;
        }

        $frontendUrl = config('app.frontend_url') ?? config('app.url') ?? 'http://localhost:3000';
        $verificationUrl = $frontendUrl . '/verify-email?token=' . $token;
        $mailgunSecret = config('services.mailgun.secret');
        $mailgunDomain = config('services.mailgun.domain');

        // Log the verification URL for debugging
        \Illuminate\Support\Facades\Log::info('📧 Sending verification email', [
            'email' => $email,
            'name' => $name,
            'token' => $token,
            'verificationUrl' => $verificationUrl,
            'frontend_url' => $frontendUrl,
        ]);

        // Send the email using the blade template
        try {
            if (empty($mailgunSecret) || empty($mailgunDomain)) {
                \Illuminate\Support\Facades\Log::warning('❌ Mailgun not configured; skipping verification email.', [
                    'email' => $email,
                ]);
                return;
            }

            $mg = \Mailgun\Mailgun::create($mailgunSecret);
            $mg->messages()->send(
                $mailgunDomain,
                [
                    'from' => 'SIMPL-TVA <postmaster@' . $mailgunDomain . '>',
                    'to' => $name . ' <' . $email . '>',
                    'subject' => 'Verify Your Email Address - ' . config('app.name'),
                    'html' => view('emails.verify-email', [
                        'name' => $name,
                        'verificationUrl' => $verificationUrl,
                        'token' => $token,
                        'frontendUrl' => $frontendUrl,
                    ])->render(),
                ]
            );
            \Illuminate\Support\Facades\Log::info('✅ Email sent successfully to: ' . $email);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('❌ Mailgun failed: ' . $e->getMessage(), [
                'exception' => $e,
            ]);
            // Don't throw - registration continues
        }
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $verificationUrl = config('app.frontend_url') . '/verify-email?token=' . ($notifiable->verification_token ?? '');

        return (new MailMessage)
            ->subject('Verify Your Email Address')
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('Thank you for registering. Please verify your email address to complete your registration.')
            ->action('Verify Email', $verificationUrl)
            ->line('This link will expire in 24 hours.')
            ->line('If you did not create an account, no further action is required.');
    }
}

