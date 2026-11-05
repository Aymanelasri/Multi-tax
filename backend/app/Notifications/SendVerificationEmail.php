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

        // Build the verification URL - use token-based verification
        $verificationUrl = config('app.frontend_url') . '/verify-email?token=' . $token;

        // Log the verification URL for debugging
        \Illuminate\Support\Facades\Log::info('📧 Sending verification email', [
            'email' => $email,
            'name' => $name,
            'token' => $token,
            'verificationUrl' => $verificationUrl,
            'frontend_url' => config('app.frontend_url'),
        ]);

        // Send the email using the blade template
        try {
            $response = \Illuminate\Support\Facades\Http::withHeaders([
                'Authorization' => 'Bearer ' . config('mail.mailers.smtp.password'),
                'Content-Type' => 'application/json',
            ])->post('https://api.resend.com/emails', [
                'from' => config('mail.from.address'),
                'to' => [$email],
                'subject' => 'Verify Your Email Address - ' . config('app.name'),
                'html' => view('emails.verify-email', [
                    'name' => $name,
                    'verificationUrl' => $verificationUrl,
                    'token' => $token,
                    'frontendUrl' => config('app.frontend_url'),
                ])->render(),
            ]);

            if ($response->successful()) {
                \Illuminate\Support\Facades\Log::info('✅ Email sent successfully to: ' . $email);
            } else {
                \Illuminate\Support\Facades\Log::error('❌ Resend API failed: ' . $response->body());
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('❌ Mail failed: ' . $e->getMessage());
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

