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
        Schema::table('orders', function (Blueprint $table) {
            if (! Schema::hasColumn('orders', 'tip_amount')) {
                $table->unsignedInteger('tip_amount')->default(0);
            }
            if (! Schema::hasColumn('orders', 'tip_note')) {
                $table->string('tip_note')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'tip_amount')) {
                $table->dropColumn('tip_amount');
            }
            if (Schema::hasColumn('orders', 'tip_note')) {
                $table->dropColumn('tip_note');
            }
        });
    }
};
