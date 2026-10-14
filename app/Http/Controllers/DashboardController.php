<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Skill;
use App\Models\Experience;
use App\Models\Message;
use App\Models\Visitor;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | stats()
    |--------------------------------------------------------------------------
    |
    | Mengembalikan ringkasan statistik portfolio sebagai JSON.
    | Digunakan oleh halaman Dashboard React.
    |
    */

    public function stats(): JsonResponse
    {
        $totalProjects     = Project::count();
        $totalSkills       = Skill::count();
        $totalExperiences  = Experience::count();
        $totalMessages     = Message::count();
        $totalVisitors     = Visitor::count();

        // Kategori project (untuk donut chart)
        $projectCategories = Project::selectRaw('category, COUNT(*) as total')
            ->whereNotNull('category')
            ->where('category', '!=', '')
            ->groupBy('category')
            ->orderByDesc('total')
            ->get()
            ->map(fn($row) => [
                'category' => $row->category,
                'total'    => (int) $row->total,
            ])
            ->values();

        return response()->json([
            'total_projects'    => $totalProjects,
            'total_skills'      => $totalSkills,
            'total_experiences' => $totalExperiences,
            'total_messages'    => $totalMessages,
            'total_visitors'    => $totalVisitors,
            'project_categories' => $projectCategories,
        ]);
    }
}