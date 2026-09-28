<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('menu_items', function (Blueprint $table) {
            if (! Schema::hasColumn('menu_items', 'kind')) {
                $table->string('kind')->nullable(); // 'Ice cream' | 'Popcorn'
            }
            if (! Schema::hasColumn('menu_items', 'ready')) {
                $table->boolean('ready')->default(false);
            }
        });
    }

    public function down(): void
    {
        Schema::table('menu_items', function (Blueprint $table) {
            if (Schema::hasColumn('menu_items', 'kind')) {
                $table->dropColumn('kind');
            }
            if (Schema::hasColumn('menu_items', 'ready')) {
                $table->dropColumn('ready');
            }
        });
    }
};
