<?php

namespace App\Http\Controllers;

use App\Models\Education;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EducationController extends Controller
{
    /**
     * Mengambil seluruh data pendidikan untuk admin dan visitor.
     */
    public function index()
    {
        $educations = Education::query()
            ->orderBy('start_year', 'desc')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'educations' => $educations,
        ], 200);
    }

    /**
     * Menambahkan data pendidikan baru.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'institution' => 'required|string|max:255',
            'degree' => 'required|string|max:255',
            'start_year' => 'required|integer|min:1900|max:2100',
            'end_year' => 'required|integer|min:1900|max:2100|gte:start_year',
            'final_grade' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'logo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($request->hasFile('logo')) {
            $validated['logo'] = $request
                ->file('logo')
                ->store('education', 'public');
        }

        $education = Education::create($validated);

        return response()->json([
            'message' => 'Data pendidikan berhasil ditambahkan.',
            'education' => $education,
        ], 201);
    }

    /**
     * Memperbarui data pendidikan berdasarkan ID.
     */
    public function update(Request $request, $id)
    {
        $education = Education::findOrFail($id);

        $validated = $request->validate([
            'institution' => 'required|string|max:255',
            'degree' => 'required|string|max:255',
            'start_year' => 'required|integer|min:1900|max:2100',
            'end_year' => 'required|integer|min:1900|max:2100|gte:start_year',
            'final_grade' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'logo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($request->hasFile('logo')) {
            // Hapus logo lama jika file-nya tersedia.
            if (
                $education->logo &&
                Storage::disk('public')->exists($education->logo)
            ) {
                Storage::disk('public')->delete($education->logo);
            }

            // Simpan logo baru.
            $validated['logo'] = $request
                ->file('logo')
                ->store('education', 'public');
        }

        $education->update($validated);

        return response()->json([
            'message' => 'Data pendidikan berhasil diperbarui.',
            'education' => $education->fresh(),
        ], 200);
    }

    /**
     * Menghapus data pendidikan beserta file logonya.
     */
    public function destroy($id)
    {
        $education = Education::findOrFail($id);

        if (
            $education->logo &&
            Storage::disk('public')->exists($education->logo)
        ) {
            Storage::disk('public')->delete($education->logo);
        }

        $education->delete();

        return response()->json([
            'message' => 'Data pendidikan berhasil dihapus.',
        ], 200);
    }
}
