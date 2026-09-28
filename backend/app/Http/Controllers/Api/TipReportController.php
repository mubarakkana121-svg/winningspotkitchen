<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;

class TipReportController extends Controller
{
    public function index()
    {
        return Order::selectRaw('YEARWEEK(created_at) as week, SUM(tip_amount) as total_tips')
            ->groupBy('week')
            ->orderByDesc('week')
            ->get();
    }
}
