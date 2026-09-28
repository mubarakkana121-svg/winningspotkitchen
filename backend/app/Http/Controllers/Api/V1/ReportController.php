<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    public function tips(): JsonResponse
    {
        $rows = Order::query()
            ->selectRaw("DATE_FORMAT(created_at, '%x-W%v') as week")
            ->selectRaw('SUM(tip_amount) as total_tips')
            ->where('tip_amount', '>', 0)
            ->groupBy('week')
            ->orderBy('week', 'desc')
            ->limit(12)
            ->get();

        return response()->json($rows);
    }
}