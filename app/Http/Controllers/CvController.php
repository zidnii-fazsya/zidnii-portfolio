<?php

namespace App\Http\Controllers;

use App\Models\Cv;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Throwable;

class CvController extends Controller
{
    /**
     * Mengambil CV terbaru.
     * GET /api/cv
     */
    public function index()
    {
        $cv = Cv::latest()->first();

        // Fallback: Jika database kosong tapi file CV fisik ada di storage/app/public/cv
        if (!$cv) {
            $disk = Storage::disk('public');
            $files = $disk->files('cv');

            if (!empty($files)) {
                usort($files, function ($a, $b) use ($disk) {
                    return $disk->lastModified($b) <=> $disk->lastModified($a);
                });

                $latestFile = $files[0];
                $originalName = basename($latestFile);

                try {
                    $cv = Cv::create([
                        'file_name' => $originalName,
                        'file_path' => $latestFile,
                        'mime_type' => $disk->mimeType($latestFile) ?: 'application/pdf',
                        'file_size' => $disk->size($latestFile),
                    ]);
                } catch (Throwable $e) {
                    report($e);
                }
            }
        }

        if (!$cv) {
            return response()->json([
                'cv' => null,
            ]);
        }

        return response()->json([
            'cv' => $this->formatCv($cv),
        ]);
    }

    /**
     * Upload CV baru dan menggantikan CV sebelumnya.
     * POST /api/cv
     */
    public function store(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'cv' => [
                    'required',
                    'file',
                    'mimes:pdf,doc,docx',
                    'max:10240',
                ],
            ],
            [
                'cv.required' => 'Silakan pilih file CV.',
                'cv.file' => 'File CV tidak valid.',
                'cv.mimes' => 'CV harus berformat PDF, DOC, atau DOCX.',
                'cv.max' => 'Ukuran file CV maksimal 10 MB.',
            ]
        );

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi file CV gagal.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $file = $request->file('cv');

        if (!$file || !$file->isValid()) {
            return response()->json([
                'message' => 'File CV tidak valid atau gagal dibaca.',
            ], 422);
        }

        $disk = Storage::disk('public');

        /*
        |--------------------------------------------------------------------------
        | Simpan file baru
        |--------------------------------------------------------------------------
        */

        $filePath = $file->store('cv', 'public');

        if (!$filePath) {
            return response()->json([
                'message' => 'File CV gagal disimpan.',
            ], 500);
        }

        /*
        |--------------------------------------------------------------------------
        | Simpan data baru dan hapus data lama
        |--------------------------------------------------------------------------
        */

        $oldFilePath = null;

        try {
            $cv = DB::transaction(function () use (
                $file,
                $filePath,
                &$oldFilePath
            ) {
                $oldCv = Cv::latest()->first();

                if ($oldCv) {
                    $oldFilePath = $oldCv->file_path;
                }

                $newCv = Cv::create([
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $filePath,
                    'mime_type' => $file->getMimeType()
                        ?: 'application/octet-stream',
                    'file_size' => $file->getSize(),
                ]);

                if ($oldCv) {
                    $oldCv->delete();
                }

                return $newCv;
            });
        } catch (Throwable $exception) {
            if ($disk->exists($filePath)) {
                $disk->delete($filePath);
            }

            report($exception);

            return response()->json([
                'message' => 'CV gagal disimpan ke database. Silakan coba kembali.',
            ], 500);
        }

        /*
        |--------------------------------------------------------------------------
        | Hapus file lama setelah transaksi berhasil
        |--------------------------------------------------------------------------
        */

        if (
            $oldFilePath &&
            $oldFilePath !== $filePath &&
            $disk->exists($oldFilePath)
        ) {
            try {
                $disk->delete($oldFilePath);
            } catch (Throwable $exception) {
                // CV baru tetap tersimpan walaupun penghapusan file lama gagal.
                report($exception);
            }
        }

        return response()->json([
            'message' => 'CV berhasil diupload.',
            'cv' => $this->formatCv($cv),
        ], 201);
    }

    /**
     * Menampilkan CV di browser.
     * GET /cv/view/{id}
     */
    public function view($id)
    {
        $cv = Cv::findOrFail($id);

        $disk = Storage::disk('public');

        if (
            !$cv->file_path ||
            !$disk->exists($cv->file_path)
        ) {
            abort(404, 'File CV tidak ditemukan.');
        }

        $filePath = $disk->path($cv->file_path);

        $headers = [
            'Content-Type' => $cv->mime_type
                ?: 'application/octet-stream',
            'Content-Disposition' => 'inline; filename="'
                . $this->safeFileName($cv->file_name)
                . '"',
            'X-Content-Type-Options' => 'nosniff',
        ];

        return response()->file($filePath, $headers);
    }

    /**
     * Mengunduh CV.
     * GET /cv/download/{id}
     */
    public function download($id)
    {
        $cv = Cv::findOrFail($id);

        $disk = Storage::disk('public');

        if (
            !$cv->file_path ||
            !$disk->exists($cv->file_path)
        ) {
            abort(404, 'File CV tidak ditemukan.');
        }

        return $disk->download(
            $cv->file_path,
            $this->safeFileName($cv->file_name),
            [
                'X-Content-Type-Options' => 'nosniff',
            ]
        );
    }

    /**
     * Format respons CV.
     */
    private function formatCv(Cv $cv): array
    {
        return [
            'id' => $cv->id,
            'file_name' => $cv->file_name,
            'file_path' => $cv->file_path,
            'mime_type' => $cv->mime_type,
            'file_size' => $cv->file_size,
            'file_size_formatted' => $this->formatFileSize(
                $cv->file_size
            ),
            'preview_url' => url('/cv/view/' . $cv->id),
            'download_url' => url('/cv/download/' . $cv->id),
            'created_at' => $cv->created_at?->format('d M Y H:i'),
        ];
    }

    /**
     * Format ukuran file.
     */
    private function formatFileSize(?int $bytes): string
    {
        if (!$bytes || $bytes < 0) {
            return '0 KB';
        }

        if ($bytes < 1024 * 1024) {
            return round($bytes / 1024, 1) . ' KB';
        }

        return round($bytes / (1024 * 1024), 1) . ' MB';
    }

    /**
     * Membersihkan nama file untuk header HTTP.
     */
    private function safeFileName(?string $fileName): string
    {
        $fileName = basename($fileName ?: 'CV');

        return str_replace(
            ["\r", "\n", '"'],
            '',
            $fileName
        );
    }
}