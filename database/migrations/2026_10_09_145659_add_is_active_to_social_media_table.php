
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('social_media', 'is_active')) {
            Schema::table('social_media', function (Blueprint $table) {
                $table->boolean('is_active')
                    ->default(true);
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('social_media', 'is_active')) {
            Schema::table('social_media', function (Blueprint $table) {
                $table->dropColumn('is_active');
            });
        }
    }
};
