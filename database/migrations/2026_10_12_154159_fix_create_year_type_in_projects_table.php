
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('projects', 'create_year')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->integer('create_year')->nullable();
            });

            return;
        }

        // PostgreSQL: ubah string menjadi integer dengan aman.
        $column = DB::selectOne("
            SELECT data_type
            FROM information_schema.columns
            WHERE table_schema = current_schema()
              AND table_name = 'projects'
              AND column_name = 'create_year'
        ");

        if ($column && $column->data_type !== 'integer') {
            // Nilai kosong menjadi NULL; nilai angka dikonversi.
            // Nilai nonangka menjadi NULL agar konversi tidak gagal.
            DB::statement("
                ALTER TABLE projects
                ALTER COLUMN create_year TYPE INTEGER
                USING (
                    CASE
                        WHEN TRIM(create_year::text) ~ '^[0-9]+$'
                        THEN TRIM(create_year::text)::INTEGER
                        ELSE NULL
                    END
                )
            ");
        }
    }

    public function down(): void
    {
        // Kembalikan tipe kolom menjadi string tanpa menghapus tahun.
        if (Schema::hasColumn('projects', 'create_year')) {
            DB::statement("
                ALTER TABLE projects
                ALTER COLUMN create_year TYPE VARCHAR(255)
                USING create_year::text
            ");
        }
    }
};
