
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /*
         * Tambahkan kolom yang belum tersedia.
         * Kolom yang sudah ada tidak akan ditambahkan ulang.
         */
        Schema::table('projects', function (Blueprint $table) {
            if (!Schema::hasColumn('projects', 'subtitle')) {
                $table->string('subtitle')->nullable();
            }

            if (!Schema::hasColumn('projects', 'technologies')) {
                $table->json('technologies')->nullable();
            }

            if (!Schema::hasColumn('projects', 'role')) {
                $table->string('role')->nullable();
            }

            if (!Schema::hasColumn('projects', 'images')) {
                $table->json('images')->nullable();
            }

            if (!Schema::hasColumn('projects', 'create_year')) {
                $table->integer('create_year')->nullable();
            }
        });
    }

    public function down(): void
    {
        /*
         * Hapus kolom yang ditambahkan migration ini.
         * Perhatian: jalankan rollback hanya jika yakin data
         * di kolom-kolom ini memang boleh dihapus.
         */
        Schema::table('projects', function (Blueprint $table) {
            $columnsToDrop = [];

            foreach ([
                'subtitle',
                'technologies',
                'role',
                'images',
                'create_year',
            ] as $column) {
                if (Schema::hasColumn('projects', $column)) {
                    $columnsToDrop[] = $column;
                }
            }

            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }
};
