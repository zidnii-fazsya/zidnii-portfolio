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
        Schema::create('cvs', function (Blueprint $table) {

            $table->id();

            // Nama file CV
            $table->string('file_name');

            // Lokasi file di storage
            $table->string('file_path');

            // MIME type file
            $table->string('mime_type')->nullable();

            // Ukuran file dalam byte
            $table->unsignedBigInteger('file_size')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cvs');
    }
};