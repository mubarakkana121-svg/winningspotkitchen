<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    public function index()
    {
        return Order::with('items')->latest()->paginate(30);
    }

    public function store(Request $r)
    {
        $data = $r->validate([
            'customer_name' => 'required|string|max:120',
            'customer_email' => 'required|email:rfc|max:255',
            'customer_phone' => 'nullable|string|max:30',
            'type' => 'required|in:pickup,delivery,preorder,takeaway',
            'scheduled_for' => 'nullable|required_if:type,preorder|date|after:now',
            'notes' => 'nullable|string|max:1000',
            'tip_amount' => 'integer|min:0',
            'tip_note' => 'nullable|string|max:120',
            'items' => 'required|array|min:1|max:30',
            'items.*.menu_item_id' => 'required|integer|distinct|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1|max:20',
        ]);

        $order = DB::transaction(function () use ($data) {
            $subtotal = 0;
            $lines = [];

            foreach ($data['items'] as $line) {
                $item = MenuItem::lockForUpdate()->findOrFail($line['menu_item_id']);

                if (! $item->is_available || $item->available_quantity < $line['quantity']) {
                    throw ValidationException::withMessages([
                        'items' => ["{$item->name} is unavailable in that quantity."],
                    ]);
                }

                $cost = $item->price * $line['quantity'];
                $subtotal += $cost;
                $lines[] = [$item, $line['quantity'], $cost];
            }

            $service = round($subtotal * .075, 2);
            $tip = $data['tip_amount'] ?? 0;

            $order = Order::create([
                ...collect($data)->except('items')->all(),
                'reference' => 'NK-'.str()->upper(str()->random(8)),
                'subtotal' => $subtotal,
                'service_charge' => $service,
                'total' => $subtotal + $service + $tip,
            ]);

            foreach ($lines as [$item, $qty, $cost]) {
                $order->items()->create([
                    'menu_item_id' => $item->id,
                    'name' => $item->name,
                    'unit_price' => $item->price,
                    'quantity' => $qty,
                    'total' => $cost,
                ]);
                $item->decrement('available_quantity', $qty);
            }

            return $order->load('items');
        });

        return response()->json($order, 201);
    }

    public function updateStatus(Request $r, Order $order)
    {
        $order->update($r->validate([
            'status' => 'required|in:new,confirmed,preparing,ready,completed,cancelled',
        ]));

        return $order;
    }
}
