<?php

namespace App\Http\Controllers;

use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    /**
     * Get profile
     */
/**
 * Get profile
 */
public function index()
{
    /*
    |--------------------------------------------------------------------------
    | Ambil Profile
    |--------------------------------------------------------------------------
    |
    | Profile utama sekaligus mengambil seluruh foto
    | yang berhubungan dengan bagian About.
    |
    */

    $profile = Profile::with([
        'photos',
    ])->first();


    return response()->json([
        'profile' => $profile,
    ]);
}
    /**
     * Create / update profile
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:150',
            ],

            'tag' => [
                'nullable',
                'string',
                'max:200',
            ],

            'bio' => [
                'nullable',
                'string',
                'max:5000',
            ],

            'photo' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048',
            ],
        ]);

        $profile = Profile::first();

        if (!$profile) {
            $profile = new Profile();
        }

        /*
        |--------------------------------------------------------------------------
        | Upload Foto
        |--------------------------------------------------------------------------
        */

        if ($request->hasFile('photo')) {

            // Hapus foto lama
            if (
                $profile->photo &&
                Storage::disk('public')->exists(
                    $profile->photo
                )
            ) {
                Storage::disk('public')->delete(
                    $profile->photo
                );
            }

            // Simpan foto baru
            $validated['photo'] = $request
                ->file('photo')
                ->store('profile', 'public');
        }

        /*
        |--------------------------------------------------------------------------
        | Simpan Data
        |--------------------------------------------------------------------------
        */

        $profile->fill($validated);
        $profile->save();

        return response()->json([
            'message' => 'Profil berhasil disimpan.',
            'profile' => $profile->fresh(),
        ]);
    }
}