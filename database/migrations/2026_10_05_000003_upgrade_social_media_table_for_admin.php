<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('social_media', function (Blueprint $table) {
            if (!Schema::hasColumn('social_media', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('url');
            }
        });
    }

    public function down(): void
    {
        Schema::table('social_media', function (Blueprint $table) {
            if (Schema::hasColumn('social_media', 'is_active')) {
                $table->dropColumn('is_active');
            }
        });
    }
};
