<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        User::updateOrCreate(
            ['email' => 'admin@tax.ma'],
            [
                'name' => 'Admin Tax',
                'email' => 'admin@tax.ma',
                'phone' => '+212600000000',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'status' => 'approved',
                'email_verified_at' => now(),
            ]
        );

        echo "✅ Admin user created:\n";
        echo "   Email: admin@tax.ma\n";
        echo "   Password: admin123\n";
        echo "   Role: admin\n";
        echo "   Status: approved\n\n";
    }
}