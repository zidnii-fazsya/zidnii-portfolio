<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProjectController extends Controller
{
    /**
     * GET /api/projects
     * Mengambil seluruh proyek.
     */
    public function index()
    {
        $projects = Project::query()
            ->orderByDesc('is_featured')
            ->orderByDesc('create_year')
            ->orderByDesc('id')
            ->get()
            ->map(fn (Project $project) => $this->formatProject($project));

        return response()->json([
            'projects' => $projects,
        ]);
    }

    /**
     * POST /api/projects
     * Membuat proyek baru.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:100'],
            'technologies' => ['nullable'],
            'role' => ['nullable', 'string', 'max:100'],
            'short_description' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'project_url' => ['nullable', 'url', 'max:2048'],
            'github_url' => ['nullable', 'url', 'max:2048'],
            'start_date' => ['nullable', 'date'],
            'end_date' => [
                'nullable',
                'date',
                'after_or_equal:start_date',
            ],
            'create_year' => [
                'nullable',
                'integer',
                'min:1900',
                'max:2200',
            ],
            'is_featured' => ['nullable', 'boolean'],
            'thumbnail' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],
            'images' => ['nullable', 'array'],
            'images.*' => [
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],
        ]);

        $validated['technologies'] = $this->parseTechnologies(
            $request->input('technologies')
        );

        $validated['is_featured'] = $request->boolean('is_featured');

        $validated['slug'] = $this->generateUniqueSlug(
            $validated['title']
        );

        if (empty($validated['create_year'])) {
            $validated['create_year'] = !empty($validated['start_date'])
                ? (int) date('Y', strtotime($validated['start_date']))
                : (int) date('Y');
        }

        // Simpan thumbnail baru jika diunggah.
        $validated['thumbnail'] = null;

        if ($request->hasFile('thumbnail')) {
            $thumbnailPath = $request->file('thumbnail')->store(
                'projects/thumbnails',
                'public'
            );

            if ($thumbnailPath === false) {
                return response()->json([
                    'message' => 'Thumbnail gagal disimpan.',
                ], 500);
            }

            $validated['thumbnail'] = $thumbnailPath;
        }

        // Simpan dokumentasi proyek.
        $imagePaths = [];

        foreach ($request->file('images', []) ?? [] as $file) {
            if (!$file || !$file->isValid()) {
                continue;
            }

            $path = $file->store(
                'projects/documentations',
                'public'
            );

            if ($path === false) {
                return response()->json([
                    'message' => 'Dokumentasi proyek gagal disimpan.',
                ], 500);
            }

            $imagePaths[] = $path;
        }

        $validated['images'] = array_values(
            array_unique($imagePaths)
        );

        $project = Project::create($validated);

        return response()->json([
            'message' => 'Project berhasil ditambahkan.',
            'project' => $this->formatProject($project->fresh()),
        ], 201);
    }

    /**
     * GET /api/projects/{id}
     * Mengambil detail proyek.
     */
    public function show($id)
    {
        $project = Project::findOrFail($id);

        return response()->json([
            'project' => $this->formatProject($project),
        ]);
    }

    /**
     * PUT/PATCH /api/projects/{id}
     * Memperbarui proyek dan mempertahankan gambar lama
     * jika tidak ada gambar pengganti.
     */
    public function update(Request $request, $id)
    {
        $project = Project::findOrFail($id);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:100'],
            'technologies' => ['nullable'],
            'role' => ['nullable', 'string', 'max:100'],
            'short_description' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'project_url' => ['nullable', 'url', 'max:2048'],
            'github_url' => ['nullable', 'url', 'max:2048'],
            'start_date' => ['nullable', 'date'],
            'end_date' => [
                'nullable',
                'date',
                'after_or_equal:start_date',
            ],
            'create_year' => [
                'nullable',
                'integer',
                'min:1900',
                'max:2200',
            ],
            'is_featured' => ['nullable', 'boolean'],
            'thumbnail' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],
            'images' => ['nullable', 'array'],
            'images.*' => [
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],
        ]);

        $validated['technologies'] = $this->parseTechnologies(
            $request->input('technologies')
        );

        $validated['is_featured'] = $request->boolean('is_featured');

        // Perbarui slug hanya jika judul berubah.
        if ($validated['title'] !== $project->title) {
            $validated['slug'] = $this->generateUniqueSlug(
                $validated['title'],
                $project->id
            );
        }

        // Pertahankan tahun lama jika tahun baru tidak dikirim.
        if (empty($validated['create_year'])) {
            if (!empty($validated['start_date'])) {
                $validated['create_year'] = (int) date(
                    'Y',
                    strtotime($validated['start_date'])
                );
            } else {
                $validated['create_year'] = $project->create_year
                    ?? (int) date('Y');
            }
        }

        // Ganti thumbnail hanya jika ada file baru.
        if ($request->hasFile('thumbnail')) {
            $newThumbnailPath = $request->file('thumbnail')->store(
                'projects/thumbnails',
                'public'
            );

            if ($newThumbnailPath === false) {
                return response()->json([
                    'message' => 'Thumbnail baru gagal disimpan.',
                ], 500);
            }

            $oldThumbnailPath = $this->getStoragePath(
                $project->thumbnail
            );

            $validated['thumbnail'] = $newThumbnailPath;

            // Hapus thumbnail lama setelah file baru tersimpan.
            if (
                $oldThumbnailPath &&
                Storage::disk('public')->exists($oldThumbnailPath)
            ) {
                Storage::disk('public')->delete($oldThumbnailPath);
            }
        } else {
            unset($validated['thumbnail']);
        }

        // Ambil dokumentasi lama.
        $existingImages = $this->normalizeImagePaths(
            $project->images
        );

        // Simpan dokumentasi tambahan.
        $newImagePaths = [];

        foreach ($request->file('images', []) ?? [] as $file) {
            if (!$file || !$file->isValid()) {
                continue;
            }

            $path = $file->store(
                'projects/documentations',
                'public'
            );

            if ($path === false) {
                return response()->json([
                    'message' => 'Dokumentasi baru gagal disimpan.',
                ], 500);
            }

            $newImagePaths[] = $path;
        }

        // Gabungkan gambar lama dan gambar baru.
        if (!empty($newImagePaths)) {
            $validated['images'] = array_values(array_unique(
                array_merge($existingImages, $newImagePaths)
            ));
        } else {
            // Jangan mengosongkan dokumentasi jika tidak ada unggahan baru.
            unset($validated['images']);
        }

        $project->update($validated);

        return response()->json([
            'message' => 'Project berhasil diperbarui.',
            'project' => $this->formatProject($project->fresh()),
        ]);
    }

    /**
     * DELETE /api/projects/{id}
     * Menghapus proyek beserta file lokalnya.
     */
    public function destroy($id)
    {
        $project = Project::findOrFail($id);
        $disk = Storage::disk('public');

        // Hapus thumbnail lokal.
        $thumbnailPath = $this->getStoragePath(
            $project->thumbnail
        );

        if ($thumbnailPath && $disk->exists($thumbnailPath)) {
            $disk->delete($thumbnailPath);
        }

        // Hapus dokumentasi lokal.
        $images = $this->normalizeImagePaths($project->images);

        foreach ($images as $image) {
            $imagePath = $this->getStoragePath($image);

            if ($imagePath && $disk->exists($imagePath)) {
                $disk->delete($imagePath);
            }
        }

        $project->delete();

        return response()->json([
            'message' => 'Project berhasil dihapus.',
        ]);
    }

    /**
     * Format data proyek untuk respons API.
     */
    private function formatProject(Project $project): array
    {
        $data = $project->toArray();

        $data['thumbnail_url'] = $this->getImageUrl(
            $project->thumbnail
        );

        $images = $this->normalizeImagePaths($project->images);

        $data['image_urls'] = array_values(array_filter(
            array_map(
                fn ($image) => $this->getImageUrl($image),
                $images
            )
        ));

        return $data;
    }

    /**
     * Normalisasi gambar menjadi array string.
     * Mendukung array, JSON, path, URL, dan objek gambar.
     */
    private function normalizeImagePaths($images): array
    {
        if (is_string($images)) {
            $decoded = json_decode($images, true);

            if (is_array($decoded)) {
                $images = $decoded;
            } else {
                $images = trim($images) !== ''
                    ? [trim($images)]
                    : [];
            }
        }

        if (!is_array($images)) {
            return [];
        }

        $paths = [];

        foreach ($images as $image) {
            if (is_string($image)) {
                $path = trim($image);
            } elseif (is_array($image)) {
                $path = $image['image']
                    ?? $image['src']
                    ?? $image['url']
                    ?? $image['path']
                    ?? null;

                $path = is_string($path) ? trim($path) : '';
            } else {
                continue;
            }

            if ($path !== '') {
                $paths[] = $path;
            }
        }

        return array_values(array_unique($paths));
    }

    /**
     * Mengubah path lokal menjadi URL gambar.
     */
    private function getImageUrl(?string $path): ?string
    {
        if (!is_string($path) || trim($path) === '') {
            return null;
        }

        $path = trim($path);

        // URL eksternal dan data URI dipertahankan.
        if (preg_match('/^(https?:\/\/|data:|blob:)/i', $path)) {
            return $path;
        }

        $path = ltrim($path, '/');

        // Hindari /storage/storage/...
        if (str_starts_with($path, 'storage/')) {
            $path = substr($path, strlen('storage/'));
        }

        return $path !== '' ? '/storage/' . $path : null;
    }

    /**
     * Mengubah path gambar lokal menjadi path disk Storage.
     */
    private function getStoragePath(?string $value): ?string
    {
        if (!is_string($value) || trim($value) === '') {
            return null;
        }

        $value = trim($value);

        // Jangan memperlakukan URL eksternal sebagai file lokal.
        if (preg_match('/^(https?:\/\/|data:|blob:)/i', $value)) {
            return null;
        }

        $value = ltrim($value, '/');

        if (str_starts_with($value, 'storage/')) {
            $value = substr($value, strlen('storage/'));
        }

        return $value !== '' ? $value : null;
    }

    /**
     * Membuat slug unik.
     */
    private function generateUniqueSlug(
        string $title,
        ?int $ignoreId = null
    ): string {
        $baseSlug = Str::slug($title);

        if ($baseSlug === '') {
            $baseSlug = 'project';
        }

        $slug = $baseSlug;
        $counter = 1;

        while (
            Project::where('slug', $slug)
                ->when(
                    $ignoreId !== null,
                    fn ($query) => $query->where('id', '!=', $ignoreId)
                )
                ->exists()
        ) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * Normalisasi teknologi menjadi array string.
     */
    private function parseTechnologies($tech): array
    {
        if (is_array($tech)) {
            return array_values(array_filter(
                array_map(
                    fn ($item) => is_scalar($item)
                        ? trim((string) $item)
                        : '',
                    $tech
                ),
                fn ($item) => $item !== ''
            ));
        }

        if (!is_string($tech) || trim($tech) === '') {
            return [];
        }

        $decoded = json_decode($tech, true);

        if (is_array($decoded)) {
            return array_values(array_filter(
                array_map(
                    fn ($item) => is_scalar($item)
                        ? trim((string) $item)
                        : '',
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
}
