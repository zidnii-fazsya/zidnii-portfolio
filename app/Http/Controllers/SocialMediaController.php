<?php

namespace App\Http\Controllers;

use App\Models\SocialMedia;
use Illuminate\Http\Request;

class SocialMediaController extends Controller
{
    public function index()
    {
        $defaultPlatforms = [
            [
                'name' => 'GitHub',
                'slug' => 'github',
                'icon' => 'github',
                'sort_order' => 1,
            ],
            [
                'name' => 'LinkedIn',
                'slug' => 'linkedin',
                'icon' => 'linkedin',
                'sort_order' => 2,
            ],
            [
                'name' => 'Instagram',
                'slug' => 'instagram',
                'icon' => 'instagram',
                'sort_order' => 3,
            ],
            [
                'name' => 'WhatsApp',
                'slug' => 'whatsapp',
                'icon' => 'whatsapp',
                'sort_order' => 4,
            ],
        ];

        foreach ($defaultPlatforms as $platform) {
            SocialMedia::firstOrCreate(
                ['slug' => $platform['slug']],
                [
                    'name' => $platform['name'],
                    'icon' => $platform['icon'],
                    'sort_order' => $platform['sort_order'],
                    'is_active' => true,
                    'url' => null,
                ]
            );
        }

        $socialMedia = SocialMedia::query()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get([
                'id',
                'name',
                'slug',
                'icon',
                'url',
                'is_active',
                'sort_order',
            ]);

        return response()->json([
            'social_media' => $socialMedia,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'social_media' => ['required', 'array'],
            'social_media.*.id' => [
                'required',
                'integer',
                'distinct',
                'exists:social_media,id',
            ],
            'social_media.*.url' => [
                'nullable',
                'string',
                'max:2048',
            ],
            'social_media.*.is_active' => [
                'sometimes',
                'boolean',
            ],
        ]);

        foreach ($validated['social_media'] as $item) {
            $url = isset($item['url'])
                ? trim($item['url'])
                : null;

            $updates = [
                'url' => $url !== '' ? $url : null,
            ];

            if (array_key_exists('is_active', $item)) {
                $updates['is_active'] = $item['is_active'];
            }

            SocialMedia::whereKey($item['id'])->update($updates);
        }

        return response()->json([
            'message' => 'Social media berhasil diperbarui.',
        ]);
    }
}
