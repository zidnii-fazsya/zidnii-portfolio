<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Admin</title>
</head>

<body>

    <h1>Dashboard Admin</h1>

    <h2>Statistics</h2>

    <p>Total Projects: {{ $totalProjects }}</p>
    <p>Total Skills: {{ $totalSkills }}</p>
    <p>Total Experiences: {{ $totalExperiences }}</p>
    <p>Total Messages: {{ $totalMessages }}</p>
    <p>Total Visitors: {{ $totalVisitors }}</p>

    <h2>Latest Projects</h2>

    @if ($latestProjects->count() > 0)

        @foreach ($latestProjects as $project)
            <div>
                <h3>{{ $project->name }}</h3>
            </div>
        @endforeach

    @else

        <p>Belum ada project.</p>

    @endif

</body>
</html>