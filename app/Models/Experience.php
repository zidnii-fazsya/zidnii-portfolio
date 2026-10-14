<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Experience extends Model
{
    protected $fillable = [
        'type',
        'position',
        'company',
        'employment_type',
        'location',
        'start_date',
        'end_date',
        'is_current',
        'description',
        'technologies',
        'company_logo',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_current' => 'boolean',
        'technologies' => 'array',
    ];

    /*
    |--------------------------------------------------------------------------
    | EXPERIENCE PHOTOS
    |--------------------------------------------------------------------------
    */

    public function photos(): HasMany
    {
        return $this->hasMany(
            ExperiencePhoto::class
        )->orderBy('order');
    }
}