<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use Illuminate\Http\JsonResponse;

class MenuController extends Controller
{
    public function index(): JsonResponse
    {
        $items = MenuItem::where('is_active', true)
            ->orderBy('category')
            ->orderBy('name')
            ->get();

        return response()->json($items);
    }
}