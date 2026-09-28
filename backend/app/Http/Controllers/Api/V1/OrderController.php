<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'customer_name'  => ['required', 'string', 'max:100'],
            'customer_email' => ['required', 'email'],
            'customer_phone' => ['required', 'string', 'max:30'],
            'type'           => ['required', 'in:takeaway,pickup,delivery'],
            'tip_amount'     => ['nullable', 'numeric', 'min:0'],
            'tip_note'       => ['nullable', 'string', 'max:255'],
            'items'          => ['required', 'array', 'min:1'],
            'items.*.menu_item_id' => ['required', 'exists:menu_items,id'],
            'items.*.quantity'     => ['required', 'integer', 'min:1', 'max:50'],
        ]);

        $subtotal = 0;
        $orderItems = [];

        foreach ($data['items'] as $row) {
            $item = MenuItem::findOrFail($row['menu_item_id']);
            $line = (float) $item->price * (int) $row['quantity'];
            $subtotal += $line;
            $orderItems[] = [
                'menu_item_id' => $item->id,
                'name'         => $item->name,
                'quantity'     => $row['quantity'],
                'price'        => $item->price,
            ];
        }

        $service = round($subtotal * 0.075, 2);
        $tip     = (float) ($data['tip_amount'] ?? 0);
        $total   = round($subtotal + $service + $tip, 2);

        $order = Order::create([
            'reference'      => 'WSK-' . strtoupper(Str::random(8)),
            'customer_name'  => $data['customer_name'],
            'customer_email' => $data['customer_email'],
            'customer_phone' => $data['customer_phone'],
            'type'           => $data['type'],
            'subtotal'       => $subtotal,
            'service'        => $service,
            'tip_amount'     => $tip,
            'tip_note'       => $data['tip_note'] ?? null,
            'total'          => $total,
            'status'         => 'new',
        ]);

        foreach ($orderItems as $row) {
            $order->items()->create($row);
        }

        return response()->json($order->load('items'), 201);
    }

    public function adminIndex(Request $request): JsonResponse
    {
        $query = Order::with('items')->orderBy('created_at', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json(['data' => $query->limit(100)->get()]);
    }

    public function adminUpdate(Request $request, Order $order): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:new,confirmed,preparing,ready,completed,cancelled'],
        ]);

        $order->update(['status' => $data['status']]);

        return response()->json($order->fresh()->load('items'));
    }
}