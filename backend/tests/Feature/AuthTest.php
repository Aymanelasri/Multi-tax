<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register()
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Aymane elasri',
            'email' => 'aymane@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'user' => ['id', 'name', 'email', 'status', 'role'],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'aymane@example.com',
            'status' => 'pending',
        ]);
    }

    public function test_user_cannot_login_without_approval()
    {
        // Create a registered user
        User::create([
            'name' => 'Aymane elasri',
            'email' => 'aymane@example.com',
            'password' => bcrypt('password123'),
            'status' => 'pending',
            'email_verified_at' => now(),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'aymane@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(403)
            ->assertJson(['message' => 'Your account is pending approval. An administrator will review your request.']);
    }

    public function test_approved_user_can_login()
    {
        // Create an approved user
        User::create([
            'name' => 'Aymane elasri',
            'email' => 'aymane@example.com',
            'password' => bcrypt('password123'),
            'status' => 'approved',
            'email_verified_at' => now(),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'aymane@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'token',
                'user' => ['id', 'name', 'email', 'status'],
            ]);
    }

    public function test_user_can_logout()
    {
        $user = User::factory()->approved()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => "Bearer $token",
        ])->postJson('/api/logout');

        $response->assertStatus(200)
            ->assertJson(['message' => 'Logged out successfully']);

        // Token should be deleted
        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
        ]);
    }

    public function test_user_cannot_login_with_wrong_password()
    {
        User::create([
            'name' => 'Aymane elasri',
            'email' => 'aymane@example.com',
            'password' => bcrypt('correct_password'),
            'status' => 'approved',
            'email_verified_at' => now(),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'aymane@example.com',
            'password' => 'wrong_password',
        ]);

        $response->assertStatus(401)
            ->assertJson(['message' => 'Invalid email or password']);
    }
}
