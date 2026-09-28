<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Staff extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $table = 'staff';

    protected $fillable = [
        'name', 'email', 'password', 'role', 'title', 'is_active',
    ];

    protected $hidden = ['password'];

    protected $casts = [
        'password' => 'hashed',
        'is_active' => 'boolean',
    ];
}