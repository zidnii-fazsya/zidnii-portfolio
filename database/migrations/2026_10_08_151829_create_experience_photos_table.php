<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('experience_photos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('experience_id')
                ->constrained('experiences')
                ->cascadeOnDelete();

            $table->string('image');

            $table->unsignedInteger('order')->default(0);

            $table->timestamps();

            $table->index([
                'experience_id',
                'order',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('experience_photos');
    }
};