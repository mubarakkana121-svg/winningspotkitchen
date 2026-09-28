<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menu_items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category');              // Soups & swallow, Rice & grains, etc.
            $table->string('kind')->nullable();      // "Ice cream", "Popcorn", etc.
            $table->decimal('price', 10, 2);
            $table->integer('available_quantity')->default(0);
            $table->string('image_url')->nullable();
            $table->text('blurb')->nullable();
            $table->boolean('ready')->default(false); // ready at the takeaway counter
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menu_items');
    }
};