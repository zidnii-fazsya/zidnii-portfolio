<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('skills', 'name') && !Schema::hasColumn('skills', 'skill_name')) {
            Schema::table('skills', function (Blueprint $table) {
                $table->renameColumn('name', 'skill_name');
            });
        }

        if (Schema::hasColumn('skills', 'category') && !Schema::hasColumn('skills', 'skill_area')) {
            Schema::table('skills', function (Blueprint $table) {
                $table->renameColumn('category', 'skill_area');
            });
        }

        Schema::table('skills', function (Blueprint $table) {
            if (!Schema::hasColumn('skills', 'level')) {
                $table->string('level', 30)->default('Intermediate');
            }

            if (!Schema::hasColumn('skills', 'technology')) {
                $table->string('technology', 100)->nullable();
            }

            if (!Schema::hasColumn('skills', 'sort_order')) {
                $table->unsignedInteger('sort_order')->default(0);
            }
        });
    }

    public function down(): void
    {
        $columns = array_values(array_filter(
            ['sort_order', 'technology', 'level'],
            fn (string $column) => Schema::hasColumn('skills', $column)
        ));

        if ($columns !== []) {
            Schema::table('skills', function (Blueprint $table) use ($columns) {
                $table->dropColumn($columns);
            });
        }

        if (Schema::hasColumn('skills', 'skill_area') && !Schema::hasColumn('skills', 'category')) {
            Schema::table('skills', function (Blueprint $table) {
                $table->renameColumn('skill_area', 'category');
            });
        }

        if (Schema::hasColumn('skills', 'skill_name') && !Schema::hasColumn('skills', 'name')) {
            Schema::table('skills', function (Blueprint $table) {
                $table->renameColumn('skill_name', 'name');
            });
        }
    }
};