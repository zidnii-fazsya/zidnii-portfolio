<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('profile_photos', function (Blueprint $table) {

            $table->id();

            /*
            |--------------------------------------------------------------------------
            | PROFILE ID
            |--------------------------------------------------------------------------
            |
            | Menentukan foto ini dimiliki oleh profile tertentu.
            |
            */

            $table->foreignId('profile_id')
                ->constrained('profiles')
                ->cascadeOnDelete();


            /*
            |--------------------------------------------------------------------------
            | IMAGE
            |--------------------------------------------------------------------------
            |
            | Menyimpan path / nama file foto.
            |
            | Contoh:
            | image/about/about-1.jpg
            |
            */

            $table->string('image');


            /*
            |--------------------------------------------------------------------------
            | ORDER
            |--------------------------------------------------------------------------
            |
            | Menentukan urutan foto pada Circular Carousel.
            |
            | Contoh:
            | 1 = foto pertama
            | 2 = foto kedua
            | 3 = foto ketiga
            |
            */

            $table->unsignedInteger('order')
                ->default(0);


            $table->timestamps();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profile_photos');
    }
};