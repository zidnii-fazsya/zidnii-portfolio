<?php

namespace App\Http\Controllers;

use App\Models\Skill;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SkillController extends Controller
{
    public function index()
    {
        return response()->json([
            'skills' => Skill::orderBy('sort_order')
                ->orderBy('id')
                ->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'skill_name' => ['required', 'string', 'max:100'],
            'level' => ['required', 'in:Beginner,Intermediate,Advanced'],
            'skill_area' => ['required', 'string', 'max:100'],
            'technology' => ['required', 'string', 'max:100'],
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        if ($request->hasFile('logo')) {
            $validated['logo'] = $request->file('logo')->store('skills', 'public');
        }

        if (!isset($validated['sort_order'])) {
            $validated['sort_order'] = (Skill::max('sort_order') ?? 0) + 1;
        }

        $skill = Skill::create($validated);

        return response()->json([
            'message' => 'Skill berhasil ditambahkan.',
            'skill' => $skill,
        ], 201);
    }

    public function show($id)
    {
        return response()->json([
            'skill' => Skill::findOrFail($id),
        ]);
    }

    public function update(Request $request, $id)
    {
        $skill = Skill::findOrFail($id);
        $validated = $request->validate([
            'skill_name' => ['required', 'string', 'max:100'],
            'level' => ['required', 'in:Beginner,Intermediate,Advanced'],
            'skill_area' => ['required', 'string', 'max:100'],
            'technology' => ['required', 'string', 'max:100'],
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $oldLogo = $skill->logo;

        if ($request->hasFile('logo')) {
            $validated['logo'] = $request->file('logo')->store('skills', 'public');
        }

        $skill->update($validated);

        if (
            isset($validated['logo']) &&
            $oldLogo &&
            Storage::disk('public')->exists($oldLogo)
        ) {
            Storage::disk('public')->delete($oldLogo);
        }

        return response()->json([
            'message' => 'Skill berhasil diperbarui.',
            'skill' => $skill->fresh(),
        ]);
    }

    public function destroy($id)
    {
        $skill = Skill::findOrFail($id);
        $logo = $skill->logo;
        $skill->delete();

        if ($logo && Storage::disk('public')->exists($logo)) {
            Storage::disk('public')->delete($logo);
        }

        return response()->json([
            'message' => 'Skill berhasil dihapus.',
        ]);
    }
}
