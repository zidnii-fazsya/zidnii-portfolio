<?php

namespace App\Http\Controllers;

use App\Mail\ContactMessageMail;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use Throwable;

class MessageController extends Controller
{
    /**
     * Menampilkan daftar pesan untuk admin.
     */
    public function index(Request $request)
    {
        $validated = $request->validate([
            'q' => ['nullable', 'string', 'max:255'],
            'status' => [
                'nullable',
                'string',
                Rule::in(['All', 'New', 'Read', 'Replied']),
            ],
        ]);

        $query = Message::query();

        if (!empty($validated['q'])) {
            $search = $validated['q'];

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%");
            });
        }

        if (
            !empty($validated['status']) &&
            $validated['status'] !== 'All'
        ) {
            $query->where('status', $validated['status']);
        }

        $messages = $query
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'messages' => $messages,
        ]);
    }

    /**
     * Menyimpan pesan dari formulir Contact pengunjung.
     */
    public function storeContact(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255'],
            'subject' => ['nullable', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        // Simpan pesan ke database terlebih dahulu.
        $message = Message::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'subject' => $validated['subject'] ?? null,
            'message' => $validated['message'],
            'status' => 'New',
            'is_read' => false,
        ]);

        // Email gagal tidak akan menghapus pesan dari database.
        $emailSent = false;

        try {
            $recipient = config('mail.contact_recipient');

            if (empty($recipient)) {
                throw new \RuntimeException(
                    'Alamat email penerima Contact belum dikonfigurasi.'
                );
            }

            Mail::to($recipient)
                ->send(new ContactMessageMail($message));

            $emailSent = true;
        } catch (Throwable $exception) {
            Log::error('Gagal mengirim notifikasi Contact.', [
                'message_id' => $message->id,
                'error' => $exception->getMessage(),
            ]);
        }

        return response()->json([
            'message' => $emailSent
                ? 'Pesan berhasil dikirim.'
                : 'Pesan tersimpan, tetapi notifikasi email gagal dikirim.',
            'data' => $message,
            'email_sent' => $emailSent,
        ], 201);
    }

    /**
     * Menampilkan detail pesan.
     * Pesan dengan status New otomatis ditandai sebagai Read.
     */
    public function show($id)
    {
        $message = Message::findOrFail($id);

        if ($message->status === 'New') {
            $message->update([
                'status' => 'Read',
                'is_read' => true,
            ]);
        }

        return response()->json([
            'message' => $message->fresh(),
        ]);
    }

    /**
     * Menandai pesan sebagai dibaca.
     */
    public function markAsRead($id)
    {
        $message = Message::findOrFail($id);

        $message->update([
            'status' => 'Read',
            'is_read' => true,
        ]);

        return response()->json([
            'message' => 'Pesan berhasil ditandai sebagai dibaca.',
            'data' => $message->fresh(),
        ]);
    }

    /**
     * Menandai pesan sebagai dibalas.
     * Fungsi ini hanya mengubah status, bukan mengirim email balasan.
     */
    public function markAsReplied($id)
    {
        $message = Message::findOrFail($id);

        $message->update([
            'status' => 'Replied',
            'is_read' => true,
        ]);

        return response()->json([
            'message' => 'Pesan berhasil ditandai sebagai dibalas.',
            'data' => $message->fresh(),
        ]);
    }

    /**
     * Menghapus pesan.
     */
    public function destroy($id)
    {
        $message = Message::findOrFail($id);
        $message->delete();

        return response()->json([
            'message' => 'Pesan berhasil dihapus.',
        ]);
    }
}
