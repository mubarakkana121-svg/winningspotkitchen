<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MenuItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'category', 'kind', 'price', 'available_quantity',
        'image_url', 'blurb', 'ready', 'is_active',
    ];

    protected $casts = [
        'price'   => 'decimal:2',
        'ready'   => 'boolean',
        'is_active' => 'boolean',
    ];
}