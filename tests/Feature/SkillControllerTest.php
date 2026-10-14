<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SkillControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_a_skill(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/skills', [
            'skill_name' => 'HTML',
            'level' => 'Intermediate',
            'skill_area' => 'Front-end',
            'technology' => 'HTML',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('skill.skill_name', 'HTML')
            ->assertJsonPath('skill.skill_area', 'Front-end');

        $this->assertDatabaseHas('skills', [
            'skill_name' => 'HTML',
            'level' => 'Intermediate',
            'skill_area' => 'Front-end',
            'technology' => 'HTML',
        ]);
    }
}