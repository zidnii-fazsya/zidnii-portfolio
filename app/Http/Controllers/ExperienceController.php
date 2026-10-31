<?php

namespace App\Http\Controllers;

use App\Models\Experience;
use App\Models\ExperiencePhoto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ExperienceController extends Controller
{
    /**
     * GET /api/experiences
     * Mengambil data experience beserta foto.
     */
    public function index(Request $request)
    {
        $query = Experience::with([
            'photos' => function ($query) {
                $query->orderBy('order')->orderBy('id');
            },
        ]);

        if ($request->filled('q')) {
            $search = $request->input('q');

            $query->where(function ($q) use ($search) {
                $q->where('position', 'like', "%{$search}%")
                    ->orWhere('company', 'like', "%{$search}%")
                    ->orWhere('employment_type', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if (
            $request->filled('type') &&
            $request->input('type') !== 'All'
        ) {
            $query->where('type', $request->input('type'));
        }

        $experiences = $query
            ->orderByDesc('start_date')
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'experiences' => $experiences,
        ]);
    }

    /**
     * POST /api/experiences
     * Membuat experience dan menyimpan beberapa foto.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => ['required', 'in:work,organization'],
            'position' => ['required', 'string', 'max:255'],
            'company' => ['required', 'string', 'max:255'],
            'employment_type' => ['nullable', 'string', 'max:100'],
            'location' => ['nullable', 'string', 'max:255'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
            'is_current' => ['nullable', 'boolean'],
            'description' => ['nullable', 'string'],
            'technologies' => ['nullable'],
            'company_logo' => [
                'nullable',
                'file',
                'mimes:jpg,jpeg,png,webp,svg',
                'max:2048',
            ],
            'photos' => ['nullable', 'array'],
            'photos.*' => [
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],
        ]);

        $validated['is_current'] = filter_var(
            $request->input('is_current', false),
            FILTER_VALIDATE_BOOLEAN
        );

        if ($validated['is_current']) {
            $validated['end_date'] = null;
        }

        $validated['technologies'] = $this->parseTechnologies(
            $request->input('technologies')
        );

        if ($request->hasFile('company_logo')) {
            $validated['company_logo'] = $request
                ->file('company_logo')
                ->store('experiences/logos', 'public');
        }

        $experience = Experience::create($validated);

        $this->storePhotos(
            $experience,
            $request->file('photos', []) ?? []
        );

        return response()->json([
            'message' => 'Experience berhasil ditambahkan.',
            'experience' => $experience->fresh()->load([
                'photos' => fn ($query) => $query
                    ->orderBy('order')
                    ->orderBy('id'),
            ]),
        ], 201);
    }

    /**
     * GET /api/experiences/{id}
     */
    public function show($id)
    {
        $experience = Experience::with([
            'photos' => fn ($query) => $query
                ->orderBy('order')
                ->orderBy('id'),
        ])->findOrFail($id);

        return response()->json([
            'experience' => $experience,
        ]);
    }

    /**
     * POST/PUT /api/experiences/{id}
     * Memperbarui data dan menambahkan foto baru tanpa
     * menghapus foto lama.
     */
    public function update(Request $request, $id)
    {
        $experience = Experience::findOrFail($id);

        $validated = $request->validate([
            'type' => ['required', 'in:work,organization'],
            'position' => ['required', 'string', 'max:255'],
            'company' => ['required', 'string', 'max:255'],
            'employment_type' => ['nullable', 'string', 'max:100'],
            'location' => ['nullable', 'string', 'max:255'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
            'is_current' => ['nullable', 'boolean'],
            'description' => ['nullable', 'string'],
            'technologies' => ['nullable'],
            'company_logo' => [
                'nullable',
                'file',
                'mimes:jpg,jpeg,png,webp,svg',
                'max:2048',
            ],
            'photos' => ['nullable', 'array'],
            'photos.*' => [
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],
        ]);

        $validated['technologies'] = $this->parseTechnologies(
            $request->input('technologies')
        );

        $validated['is_current'] = filter_var(
            $request->input('is_current', false),
            FILTER_VALIDATE_BOOLEAN
        );

        if ($validated['is_current']) {
            $validated['end_date'] = null;
        }

        if ($request->hasFile('company_logo')) {
            if (
                $experience->company_logo &&
                Storage::disk('public')->exists($experience->company_logo)
            ) {
                Storage::disk('public')->delete(
                    $experience->company_logo
                );
            }

            $validated['company_logo'] = $request
                ->file('company_logo')
                ->store('experiences/logos', 'public');
        } else {
            unset($validated['company_logo']);
        }

        $experience->update($validated);

        $this->storePhotos(
            $experience,
            $request->file('photos', []) ?? []
        );

        return response()->json([
            'message' => 'Experience berhasil diperbarui.',
            'experience' => $experience->fresh()->load([
                'photos' => fn ($query) => $query
                    ->orderBy('order')
                    ->orderBy('id'),
            ]),
        ]);
    }

    /**
     * DELETE /api/experiences/{id}
     */
    public function destroy($id)
    {
        $experience = Experience::with('photos')->findOrFail($id);

        if (
            $experience->company_logo &&
            Storage::disk('public')->exists($experience->company_logo)
        ) {
            Storage::disk('public')->delete(
                $experience->company_logo
            );
        }

        foreach ($experience->photos as $photo) {
            $this->deletePhotoFile($photo->image);
        }

        $experience->delete();

        return response()->json([
            'message' => 'Experience berhasil dihapus.',
        ]);
    }

    /**
     * DELETE /api/experience-photos/{id}
     */
    public function destroyPhoto($id)
    {
        $photo = ExperiencePhoto::findOrFail($id);

        $this->deletePhotoFile($photo->image);
        $photo->delete();

        return response()->json([
            'message' => 'Foto experience berhasil dihapus.',
        ]);
    }

    /**
     * Menyimpan beberapa foto ke public/image/experiences/{id}.
     */
    private function storePhotos(Experience $experience, array $files): void
    {
        $files = array_filter($files);

        if (empty($files)) {
            return;
        }

        $directory = public_path(
            'image/experiences/' . $experience->id
        );

        if (!File::exists($directory)) {
            File::makeDirectory($directory, 0755, true);
        }

        $lastOrder = $experience->photos()->max('order');
        $order = $lastOrder !== null ? $lastOrder + 1 : 1;

        foreach ($files as $file) {
            if (!$file->isValid()) {
                continue;
            }

            $extension = strtolower(
                $file->getClientOriginalExtension()
            );

            $filename = 'experience-' .
                $experience->id . '-' .
                Str::uuid() . '.' . $extension;

            $originalName = $file->getClientOriginalName();

            $file->move($directory, $filename);

            ExperiencePhoto::create([
                'experience_id' => $experience->id,
                'image' => 'image/experiences/' .
                    $experience->id . '/' . $filename,
                'original_name' => $originalName,
                'order' => $order,
            ]);

            $order++;
        }
    }

    /**
     * Menghapus file foto dari folder public.
     */
    private function deletePhotoFile(?string $path): void
    {
        if (!$path) {
            return;
        }

        // File foto Experience disimpan pada public/image/...
        $normalizedPath = ltrim(
            str_replace('\\', '/', $path),
            '/'
        );

        // Batasi penghapusan ke direktori dokumentasi Experience.
        if (!str_starts_with($normalizedPath, 'image/experiences/')) {
            return;
        }

        $fullPath = public_path($normalizedPath);

        if (File::exists($fullPath) && File::isFile($fullPath)) {
            File::delete($fullPath);
        }
    }

    /**
     * Mengubah technologies menjadi array.
     */
    private function parseTechnologies($tech): array
    {
        if (is_array($tech)) {
            return array_values(array_filter(
                array_map(
                    fn ($item) => trim((string) $item),
                    $tech
                ),
                fn ($item) => $item !== ''
            ));
        }

        if (is_string($tech) && trim($tech) !== '') {
            $decoded = json_decode($tech, true);

            if (is_array($decoded)) {
                return array_values(array_filter(
                    array_map(
                        fn ($item) => trim((string) $item),
                        $decoded
                    ),
                    fn ($item) => $item !== ''
                ));
            }

            return array_values(array_filter(
                array_map('trim', explode(',', $tech)),
                fn ($item) => $item !== ''
            ));
        }

        return [];
    }
}