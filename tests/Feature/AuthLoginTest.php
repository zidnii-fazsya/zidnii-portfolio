<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_page_renders(): void
    {
        $response = $this->get('/login');

        $response->assertOk();
        $response->assertSee('Welcome Back');
        $response->assertSee('Email');
        $response->assertSee('Password');
    }

    public function test_admin_user_can_login(): void
    {
        User::create([
            'name' => 'Admin Portfolio',
            'email' => 'admin@portfolio.test',
            'password' => bcrypt('admin123'),
        ]);

        $response = $this->post('/login', [
            'email' => 'admin@portfolio.test',
            'password' => 'admin123',
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertAuthenticated();
    }
}
