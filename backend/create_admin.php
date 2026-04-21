<?php

// Simple script to create admin user
// Run: php create_admin.php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

try {
    $admin = User::updateOrCreate(
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

    echo "✅ Admin user created successfully!\n";
    echo "   Email: admin@tax.ma\n";
    echo "   Password: admin123\n";
    echo "   Role: admin\n";
    echo "   Status: approved\n\n";
    echo "You can now login at http://localhost:3000/login\n";
    
} catch (Exception $e) {
    echo "❌ Error creating admin user: " . $e->getMessage() . "\n";
}