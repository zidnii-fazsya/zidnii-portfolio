<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Skill extends Model
{
    protected $table = 'skills';

    protected $fillable = [
        'skill_name',
        'level',
        'skill_area',
        'technology',
        'logo',
        'sort_order',
    ];
}