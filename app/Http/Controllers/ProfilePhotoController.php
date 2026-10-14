<?php

namespace App\Http\Controllers;

use App\Models\Profile;
use App\Models\ProfilePhoto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Validator;

class ProfilePhotoController extends Controller
{
    /**
     * =========================================================================
     * GET ALL PROFILE PHOTOS
     * =========================================================================
     *
     * Mengambil seluruh foto About berdasarkan urutan.
     *
     * GET /api/profile/photos
     */
    public function index()
    {
        $profile = Profile::first();

        if (!$profile) {
            return response()->json([
                'message' => 'Profile belum tersedia.',
                'photos' => [],
            ], 404);
        }

        $photos = $profile->photos()
            ->orderBy('order')
            ->get();

        return response()->json([
            'photos' => $photos,
        ]);
    }


    /**
     * =========================================================================
     * UPLOAD PROFILE PHOTO
     * =========================================================================
     *
     * Menambahkan satu foto About.
     *
     * POST /api/profile/photos
     */
    public function store(Request $request)
    {
        /*
        |--------------------------------------------------------------------------
        | Validasi
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([
            'image' => [
                'required',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],

            'order' => [
                'required',
                'integer',
                'min:1',
                'max:5',
            ],
        ]);


        /*
        |--------------------------------------------------------------------------
        | Profile
        |--------------------------------------------------------------------------
        */

        $profile = Profile::first();

        if (!$profile) {
            return response()->json([
                'message' => 'Profile belum tersedia.',
            ], 404);
        }


        /*
        |--------------------------------------------------------------------------
        | Batasi Maksimal 5 Foto
        |--------------------------------------------------------------------------
        */

        $totalPhotos = $profile->photos()->count();

        if ($totalPhotos >= 5) {
            return response()->json([
                'message' => 'Maksimal 5 foto About diperbolehkan.',
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Cek Order
        |--------------------------------------------------------------------------
        |
        | Satu posisi hanya boleh digunakan satu foto.
        |
        */

        $orderExists = $profile->photos()
            ->where('order', $validated['order'])
            ->exists();

        if ($orderExists) {
            return response()->json([
                'message' => 'Urutan foto tersebut sudah digunakan.',
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Upload
        |--------------------------------------------------------------------------
        |
        | Foto About disimpan langsung di:
        |
        | public/image/about
        |
        */

        $directory = public_path(
            'image/about'
        );


        if (!File::exists($directory)) {
            File::makeDirectory(
                $directory,
                0755,
                true
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Generate Filename
        |--------------------------------------------------------------------------
        */

        $file = $request->file('image');

        $filename =
            'about-' .
            $validated['order'] .
            '-' .
            time() .
            '.' .
            $file->getClientOriginalExtension();


        /*
        |--------------------------------------------------------------------------
        | Move File
        |--------------------------------------------------------------------------
        */

        $file->move(
            $directory,
            $filename
        );


        /*
        |--------------------------------------------------------------------------
        | Simpan Database
        |--------------------------------------------------------------------------
        */

        $photo = ProfilePhoto::create([
            'profile_id' => $profile->id,

            'image' =>
                'image/about/' .
                $filename,

            'order' =>
                $validated['order'],
        ]);


        return response()->json([
            'message' => 'Foto About berhasil ditambahkan.',

            'photo' => $photo,
        ], 201);
    }


    /**
     * =========================================================================
     * UPDATE PROFILE PHOTO
     * =========================================================================
     *
     * Mengubah foto atau urutan foto.
     *
     * PUT /api/profile/photos/{id}
     */
    public function update(
        Request $request,
        $id
    ) {

        $photo = ProfilePhoto::find($id);

        if (!$photo) {
            return response()->json([
                'message' => 'Foto tidak ditemukan.',
            ], 404);
        }


        /*
        |--------------------------------------------------------------------------
        | Validasi
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([
            'image' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],

            'order' => [
                'required',
                'integer',
                'min:1',
                'max:5',
            ],
        ]);


        /*
        |--------------------------------------------------------------------------
        | Cek Order
        |--------------------------------------------------------------------------
        */

        $orderExists = ProfilePhoto::where(
            'profile_id',
            $photo->profile_id
        )
            ->where(
                'order',
                $validated['order']
            )
            ->where(
                'id',
                '!=',
                $photo->id
            )
            ->exists();


        if ($orderExists) {

            return response()->json([
                'message' =>
                    'Urutan foto tersebut sudah digunakan.',
            ], 422);

        }


        /*
        |--------------------------------------------------------------------------
        | Upload Foto Baru
        |--------------------------------------------------------------------------
        */

        if ($request->hasFile('image')) {

            /*
            |--------------------------------------------------------------------------
            | Hapus Foto Lama
            |--------------------------------------------------------------------------
            */

            $oldPath = public_path(
                $photo->image
            );

            if (File::exists($oldPath)) {
                File::delete($oldPath);
            }


            /*
            |--------------------------------------------------------------------------
            | Directory
            |--------------------------------------------------------------------------
            */

            $directory = public_path(
                'image/about'
            );


            if (!File::exists($directory)) {

                File::makeDirectory(
                    $directory,
                    0755,
                    true
                );

            }


            /*
            |--------------------------------------------------------------------------
            | Filename Baru
            |--------------------------------------------------------------------------
            */

            $file =
                $request->file('image');

            $filename =
                'about-' .
                $validated['order'] .
                '-' .
                time() .
                '.' .
                $file->getClientOriginalExtension();


            /*
            |--------------------------------------------------------------------------
            | Simpan
            |--------------------------------------------------------------------------
            */

            $file->move(
                $directory,
                $filename
            );


            $photo->image =
                'image/about/' .
                $filename;
        }


        /*
        |--------------------------------------------------------------------------
        | Update Order
        |--------------------------------------------------------------------------
        */

        $photo->order =
            $validated['order'];


        $photo->save();


        return response()->json([
            'message' =>
                'Foto About berhasil diperbarui.',

            'photo' =>
                $photo->fresh(),
        ]);
    }


    /**
     * =========================================================================
     * DELETE PROFILE PHOTO
     * =========================================================================
     *
     * DELETE /api/profile/photos/{id}
     */
    public function destroy($id)
    {
        $photo = ProfilePhoto::find($id);

        if (!$photo) {

            return response()->json([
                'message' =>
                    'Foto tidak ditemukan.',
            ], 404);

        }


        /*
        |--------------------------------------------------------------------------
        | Hapus File
        |--------------------------------------------------------------------------
        */

        $path = public_path(
            $photo->image
        );


        if (File::exists($path)) {
            File::delete($path);
        }


        /*
        |--------------------------------------------------------------------------
        | Hapus Database
        |--------------------------------------------------------------------------
        */

        $photo->delete();


        return response()->json([
            'message' =>
                'Foto About berhasil dihapus.',
        ]);
    }
}