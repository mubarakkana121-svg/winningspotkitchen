<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class StaffAuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $staff = Staff::where('email', $data['email'])->first();

        if (! $staff || ! Hash::check($data['password'], $staff->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $staff->tokens()->delete();
        $token = $staff->createToken('staff_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'    => $staff->id,
                'name'  => $staff->name,
                'email' => $staff->email,
                'role'  => $staff->role,
                'title' => $staff->title,
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => $request->user()]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out.']);
    }
}