<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference', 'customer_name', 'customer_email', 'customer_phone',
        'type', 'subtotal', 'service', 'tip_amount', 'tip_note',
        'total', 'status', 'notes',
    ];

    protected $casts = [
        'subtotal'    => 'decimal:2',
        'service'     => 'decimal:2',
        'tip_amount'  => 'decimal:2',
        'total'       => 'decimal:2',
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}