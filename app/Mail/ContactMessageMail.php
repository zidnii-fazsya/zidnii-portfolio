<?php

namespace App\Mail;

use App\Models\Message;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactMessageMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Message $contactMessage
    ) {
    }

    public function envelope(): Envelope
    {
        $subject = $this->contactMessage->subject ?: 'Contact Form';

        return new Envelope(
            subject: 'Pesan Baru dari Portfolio - ' . $subject,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.contact-message',
            with: [
                'contactMessage' => $this->contactMessage,
            ],
        );
    }
}
