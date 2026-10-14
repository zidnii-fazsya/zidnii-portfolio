<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        /*
        |--------------------------------------------------------------------------
        | EXPERIENCE TABLE UPGRADE
        |--------------------------------------------------------------------------
        |
        | The experiences table is already created by
        | 2026_10_01_024419_create_experiences_table.php
        |
        | The complete structure is defined in that migration.
        |
        */
    }

    public function down(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Nothing to rollback
        |--------------------------------------------------------------------------
        |
        | The experiences table belongs to the original
        | create_experiences_table migration.
        |
        */
    }
};