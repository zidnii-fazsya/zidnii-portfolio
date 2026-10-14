
<?php

use App\Http\Controllers\Auth\LoginadminController;
use App\Http\Controllers\CvController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EducationController;
use App\Http\Controllers\SocialMediaController;
use App\Http\Controllers\SkillController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ExperienceController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProfilePhotoController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Log;

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/

// Visitor Home
Route::get('/', function () {
    return view('app');
})->name('home');

// Visitor Education
Route::get('/visitor/education', function () {
    return view('app');
})->name('visitor.education');

// Visitor Contact
Route::get('/visitor/contact', function () {
    return view('app');
})->name('visitor.contact');

Route::get('/contact', function () {
    return view('app');
})->name('contact');

// Login Page
Route::get('/login', function () {
    return view('app');
})->name('login');

// Login and Logout
Route::post('/login', [
    LoginadminController::class,
    'login',
]);

Route::post('/logout', [
    LoginadminController::class,
    'logout',
]);

/*
|--------------------------------------------------------------------------
| EMAIL TEST ROUTE (LOCAL ONLY)
|--------------------------------------------------------------------------
|
| Gunakan untuk memastikan SMTP Gmail berfungsi.
| Route hanya tersedia jika APP_ENV=local.
| Hapus setelah pengujian selesai.
|
*/

if (App::environment('local')) {
    Route::get('/test-email', function () {
        $recipient = config('mail.contact_recipient')
            ?: env('MAIL_CONTACT_RECIPIENT');

        if (empty($recipient)) {
            return response()->json([
                'success' => false,
                'message' => 'Email penerima belum dikonfigurasi.',
            ], 500);
        }

        try {
            Mail::raw(
                'Tes email dari Laravel Portfolio berhasil!',
                function ($message) use ($recipient) {
                    $message->to($recipient)
                        ->subject('Tes Email Portfolio');
                }
            );

            return response()->json([
                'success' => true,
                'message' => 'Email diteruskan ke mail server. Periksa Inbox dan Spam Gmail.',
            ]);
        } catch (\Throwable $e) {
            Log::error('Portfolio email test failed.', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Pengiriman email gagal. Periksa konfigurasi SMTP dan log Laravel.',
            ], 500);
        }
    })->name('test.email');
}

/*
|--------------------------------------------------------------------------
| PUBLIC CV ROUTES
|--------------------------------------------------------------------------
*/

Route::get('/api/cv', [
    CvController::class,
    'index',
])->name('api.cv.index');

Route::get('/cv/view/{id}', [
    CvController::class,
    'view',
])->whereNumber('id')->name('cv.view');

Route::get('/cv/download/{id}', [
    CvController::class,
    'download',
])->whereNumber('id')->name('cv.download');

/*
|--------------------------------------------------------------------------
| PUBLIC PROFILE API
|--------------------------------------------------------------------------
*/

Route::get('/api/profile', [
    ProfileController::class,
    'index',
]);

/*
|--------------------------------------------------------------------------
| PUBLIC EDUCATION API
|--------------------------------------------------------------------------
*/

Route::get('/api/educations', [
    EducationController::class,
    'index',
]);

/*
|--------------------------------------------------------------------------
| PUBLIC EXPERIENCE API
|--------------------------------------------------------------------------
*/

Route::get('/api/experiences', [
    ExperienceController::class,
    'index',
]);

Route::get('/api/experiences/{id}', [
    ExperienceController::class,
    'show',
])->whereNumber('id');

/*
|--------------------------------------------------------------------------
| PUBLIC PROJECT API
|--------------------------------------------------------------------------
*/

Route::get('/api/projects', [
    ProjectController::class,
    'index',
]);

Route::get('/api/projects/{id}', [
    ProjectController::class,
    'show',
])->whereNumber('id');

/*
|--------------------------------------------------------------------------
| PUBLIC SOCIAL MEDIA API
|--------------------------------------------------------------------------
*/

Route::get('/api/social-media', [
    SocialMediaController::class,
    'index',
]);

/*
|--------------------------------------------------------------------------
| PUBLIC SKILLS API
|--------------------------------------------------------------------------
*/

Route::get('/api/public/skills', [
    SkillController::class,
    'index',
]);

/*
|--------------------------------------------------------------------------
| PUBLIC CONTACT API
|--------------------------------------------------------------------------
|
| Pesan dapat dikirim tanpa login.
| Maksimal 5 percobaan per menit per pengguna/IP.
| Pengiriman email otomatis harus ditangani oleh
| MessageController::storeContact().
|
*/

Route::post('/api/contact', [
    MessageController::class,
    'storeContact',
])->middleware('throttle:5,1')->name('api.contact.store');

/*
|--------------------------------------------------------------------------
| AUTHENTICATED ADMIN ROUTES
|--------------------------------------------------------------------------
*/

Route::middleware('auth')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | DASHBOARD
    |--------------------------------------------------------------------------
    */

    Route::get('/dashboard', function () {
        return view('app');
    })->name('dashboard');

    Route::get('/api/dashboard/stats', [
        DashboardController::class,
        'stats',
    ]);

    /*
    |--------------------------------------------------------------------------
    | PROFILE
    |--------------------------------------------------------------------------
    */

    Route::get('/profile', function () {
        return view('app');
    })->name('profile');

    Route::post('/api/profile', [
        ProfileController::class,
        'update',
    ]);

    /*
    |--------------------------------------------------------------------------
    | PROFILE PHOTOS
    |--------------------------------------------------------------------------
    */

    Route::get('/api/profile/photos', [
        ProfilePhotoController::class,
        'index',
    ]);

    Route::post('/api/profile/photos', [
        ProfilePhotoController::class,
        'store',
    ]);

    Route::put('/api/profile/photos/{id}', [
        ProfilePhotoController::class,
        'update',
    ])->whereNumber('id');

    Route::delete('/api/profile/photos/{id}', [
        ProfilePhotoController::class,
        'destroy',
    ])->whereNumber('id');

    /*
    |--------------------------------------------------------------------------
    | CV ADMIN
    |--------------------------------------------------------------------------
    */

    Route::get('/cv', function () {
        return view('app');
    })->name('cv');

    Route::post('/api/cv', [
        CvController::class,
        'store',
    ])->name('api.cv.store');

    /*
    |--------------------------------------------------------------------------
    | EDUCATION ADMIN
    |--------------------------------------------------------------------------
    */

    Route::get('/education', function () {
        return view('app');
    })->name('education');

    Route::post('/api/educations', [
        EducationController::class,
        'store',
    ]);

    Route::put('/api/educations/{id}', [
        EducationController::class,
        'update',
    ])->whereNumber('id');

    Route::delete('/api/educations/{id}', [
        EducationController::class,
        'destroy',
    ])->whereNumber('id');

    /*
    |--------------------------------------------------------------------------
    | SOCIAL MEDIA ADMIN
    |--------------------------------------------------------------------------
    */

    Route::get('/social-media', function () {
        return view('app');
    })->name('social-media');

    Route::put('/api/social-media', [
        SocialMediaController::class,
        'update',
    ]);

    /*
    |--------------------------------------------------------------------------
    | SKILLS ADMIN
    |--------------------------------------------------------------------------
    */

    Route::get('/skills', function () {
        return view('app');
    })->name('skills');

    Route::get('/skills/add', function () {
        return view('app');
    })->name('skills.add');

    Route::get('/skills/edit/{id}', function () {
        return view('app');
    })->whereNumber('id')->name('skills.edit');

    Route::get('/api/skills', [
        SkillController::class,
        'index',
    ]);

    Route::post('/api/skills', [
        SkillController::class,
        'store',
    ]);

    Route::get('/api/skills/{id}', [
        SkillController::class,
        'show',
    ])->whereNumber('id');

    Route::post('/api/skills/{id}', [
        SkillController::class,
        'update',
    ])->whereNumber('id');

    Route::delete('/api/skills/{id}', [
        SkillController::class,
        'destroy',
    ])->whereNumber('id');

    /*
    |--------------------------------------------------------------------------
    | PROJECTS ADMIN
    |--------------------------------------------------------------------------
    */

    Route::get('/projects', function () {
        return view('app');
    })->name('projects');

    Route::get('/projects/add', function () {
        return view('app');
    })->name('projects.add');

    Route::get('/projects/edit/{id}', function () {
        return view('app');
    })->whereNumber('id')->name('projects.edit');

    Route::post('/api/projects', [
        ProjectController::class,
        'store',
    ]);

    Route::post('/api/projects/{id}', [
        ProjectController::class,
        'update',
    ])->whereNumber('id');

    Route::put('/api/projects/{id}', [
        ProjectController::class,
        'update',
    ])->whereNumber('id');

    Route::delete('/api/projects/{id}', [
        ProjectController::class,
        'destroy',
    ])->whereNumber('id');

    /*
    |--------------------------------------------------------------------------
    | EXPERIENCE ADMIN
    |--------------------------------------------------------------------------
    */

    Route::get('/experience', function () {
        return view('app');
    })->name('experience');

    Route::post('/api/experiences', [
        ExperienceController::class,
        'store',
    ]);

    Route::post('/api/experiences/{id}', [
        ExperienceController::class,
        'update',
    ])->whereNumber('id');

    Route::put('/api/experiences/{id}', [
        ExperienceController::class,
        'update',
    ])->whereNumber('id');

    Route::delete('/api/experiences/{id}', [
        ExperienceController::class,
        'destroy',
    ])->whereNumber('id');

    Route::delete('/api/experience-photos/{id}', [
        ExperienceController::class,
        'destroyPhoto',
    ])->whereNumber('id');

    /*
    |--------------------------------------------------------------------------
    | MESSAGES ADMIN
    |--------------------------------------------------------------------------
    */

    Route::get('/messages', function () {
        return view('app');
    })->name('messages');

    Route::get('/messages/{id}', function () {
        return view('app');
    })->whereNumber('id')->name('messages.show');

    Route::get('/api/messages', [
        MessageController::class,
        'index',
    ]);

    Route::get('/api/messages/{id}', [
        MessageController::class,
        'show',
    ])->whereNumber('id');

    Route::post('/api/messages/{id}/read', [
        MessageController::class,
        'markAsRead',
    ])->whereNumber('id');

    Route::post('/api/messages/{id}/reply', [
        MessageController::class,
        'markAsReplied',
    ])->whereNumber('id');

    Route::delete('/api/messages/{id}', [
        MessageController::class,
        'destroy',
    ])->whereNumber('id');
});
