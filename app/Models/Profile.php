<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Profile extends Model
{
    protected $table = 'profiles';


    /*
    |--------------------------------------------------------------------------
    | MASS ASSIGNMENT
    |--------------------------------------------------------------------------
    */

    protected $fillable = [
        'name',
        'tag',
        'bio',
        'photo',
    ];


    /*
    |--------------------------------------------------------------------------
    | RELATIONSHIP
    |--------------------------------------------------------------------------
    |
    | Satu Profile dapat memiliki banyak foto
    | untuk bagian About.
    |
    */

    public function photos(): HasMany
    {
        return $this->hasMany(
            ProfilePhoto::class
        )->orderBy('order');
    }
}