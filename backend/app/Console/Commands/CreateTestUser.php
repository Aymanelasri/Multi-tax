<?php

namespace App\Console\Commands;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CreateTestUser extends Command
{
    protected $signature = 'create:test-user';
    protected $description = 'Create a test user for development';

    public function handle(): int
    {
        $user = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'phone' => '0612345678',
                'password' => Hash::make('password123'),
                'email_verified_at' => Carbon::now(),
                'status' => 'approved',
                'role' => 'user',
            ]
        );

        $this->info("✅ Test user ready!");
        $this->info("📧 Email: test@example.com");
        $this->info("🔐 Password: password123");
        $this->info("Status: {$user->status}");
        $this->info("Verified: " . ($user->email_verified_at ? 'Yes' : 'No'));

        return self::SUCCESS;
    }
}
