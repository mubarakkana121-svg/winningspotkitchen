<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'        => ['required', 'string', 'max:100'],
            'email'       => ['required', 'email'],
            'phone'       => ['required', 'string', 'max:30'],
            'guest_count' => ['required', 'integer', 'min:1', 'max:50'],
            'reserved_at' => ['required', 'date'],
            'occasion'    => ['nullable', 'string', 'max:100'],
        ]);

        $reservation = Reservation::create([
            ...$data,
            'status' => 'new',
        ]);

        return response()->json($reservation, 201);
    }

    public function adminIndex(): JsonResponse
    {
        return response()->json([
            'data' => Reservation::orderBy('reserved_at', 'desc')->limit(100)->get(),
        ]);
    }

    public function adminUpdate(Request $request, Reservation $reservation): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:new,confirmed,seated,completed,cancelled'],
        ]);

        $reservation->update(['status' => $data['status']]);

        return response()->json($reservation->fresh());
    }
}