<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    /**
     * Kolom yang dapat diisi melalui mass assignment.
     */
    protected $fillable = [
        'title',
        'subtitle',
        'slug',
        'category',
        'technologies',
        'role',
        'short_description',
        'description',
        'thumbnail',
        'images',
        'project_url',
        'github_url',
        'start_date',
        'end_date',
        'create_year',
        'is_featured',
    ];

    /**
     * Konversi tipe data atribut model.
     */
    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'create_year' => 'integer',
        'is_featured' => 'boolean',
        'technologies' => 'array',
        'images' => 'array',
    ];
}