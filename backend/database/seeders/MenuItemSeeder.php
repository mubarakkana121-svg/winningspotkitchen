<?php

namespace Database\Seeders;

use App\Models\MenuItem;
use Illuminate\Database\Seeder;

class MenuItemSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            ['Woodfire Jollof', 'Mains', 4200, 14],
            ['Smoky Suya Skewers', 'Grill', 3800, 8],
            ['Coconut Curry', 'Mains', 3600, 11],
            ['Plantain & Pepper', 'Snacks', 1800, 22],
            ['Grilled Sea Bass', 'Seafood', 7200, 5],
            ['Zobo Spritz', 'Drinks', 1400, 30],
        ];

        foreach ($items as [$name, $category, $price, $qty]) {
            MenuItem::create([
                'name' => $name,
                'category' => $category,
                'price' => $price,
                'available_quantity' => $qty,
                'is_available' => true,
            ]);
        }
    }
}
