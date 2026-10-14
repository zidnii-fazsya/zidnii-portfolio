<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('experiences', function (Blueprint $table) {
            $table->id();

            /*
            |--------------------------------------------------------------------------
            | EXPERIENCE TYPE
            |--------------------------------------------------------------------------
            | work         = Work Experience
            | organization = Organization Experience
            |--------------------------------------------------------------------------
            */
            $table->string('type')->default('work');

            /*
            |--------------------------------------------------------------------------
            | BASIC INFORMATION
            |--------------------------------------------------------------------------
            */
            $table->string('position');
            $table->string('company');

            $table->string('employment_type')->nullable();
            $table->string('location')->nullable();

            /*
            |--------------------------------------------------------------------------
            | PERIOD
            |--------------------------------------------------------------------------
            */
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();

            $table->boolean('is_current')->default(false);

            /*
            |--------------------------------------------------------------------------
            | DESCRIPTION
            |--------------------------------------------------------------------------
            */
            $table->text('description')->nullable();

            /*
            |--------------------------------------------------------------------------
            | TECHNOLOGIES
            |--------------------------------------------------------------------------
            */
            $table->json('technologies')->nullable();

            /*
            |--------------------------------------------------------------------------
            | COMPANY / ORGANIZATION LOGO
            |--------------------------------------------------------------------------
            */
            $table->string('company_logo')->nullable();

            /*
            |--------------------------------------------------------------------------
            | TIMESTAMPS
            |--------------------------------------------------------------------------
            */
            $table->timestamps();

            /*
            |--------------------------------------------------------------------------
            | INDEX
            |--------------------------------------------------------------------------
            */
            $table->index('type');
            $table->index('start_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('experiences');
    }
};