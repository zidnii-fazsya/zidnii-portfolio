<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProfilePhoto extends Model
{
    protected $table = 'profile_photos';


    /*
    |--------------------------------------------------------------------------
    | MASS ASSIGNMENT
    |--------------------------------------------------------------------------
    */

    protected $fillable = [
        'profile_id',
        'image',
        'order',
    ];


    /*
    |--------------------------------------------------------------------------
    | CASTS
    |--------------------------------------------------------------------------
    */

    protected $casts = [
        'order' => 'integer',
    ];


    /*
    |--------------------------------------------------------------------------
    | RELATIONSHIP
    |--------------------------------------------------------------------------
    |
    | Setiap ProfilePhoto dimiliki oleh satu Profile.
    |
    */

    public function profile(): BelongsTo
    {
        return $this->belongsTo(
            Profile::class
        );
    }
}