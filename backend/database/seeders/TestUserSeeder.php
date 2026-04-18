<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class TestUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a test user with verified email and approved status
        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'phone' => '0612345678',
                'password' => Hash::make('Password123'),
                'email_verified_at' => Carbon::now(),
                'status' => 'approved',
                'role' => 'user',
            ]
        );

        echo "✅ Test user created: test@example.com / Password123\n";
    }
}
