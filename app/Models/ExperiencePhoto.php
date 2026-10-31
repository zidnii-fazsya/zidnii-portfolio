<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExperiencePhoto extends Model
{
    protected $fillable = [
        'experience_id',
        'image',
        'original_name',
        'order',
    ];

    protected $casts = [
        'order' => 'integer',
    ];

    /*
    |--------------------------------------------------------------------------
    | EXPERIENCE
    |--------------------------------------------------------------------------
    */

    public function experience(): BelongsTo
    {
        return $this->belongsTo(
            Experience::class
        );
    }
}