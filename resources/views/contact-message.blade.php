
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pesan Baru dari Portfolio</title>
</head>
<body style="margin: 0; padding: 24px; font-family: Arial, sans-serif; color: #333333; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; padding: 28px; background-color: #ffffff; border-radius: 10px;">
        <h2 style="margin-top: 0; color: #3d141e;">
            Pesan Baru dari Portfolio
        </h2>

        <p>
            Kamu menerima pesan baru dari formulir Contact website portfolio.
        </p>

        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;">

        <p>
            <strong>Nama:</strong><br>
            {{ $contactMessage->name }}
        </p>

        <p>
            <strong>Email pengirim:</strong><br>
            {{ $contactMessage->email }}
        </p>

        <p>
            <strong>Subjek:</strong><br>
            {{ $contactMessage->subject ?: 'Tidak ada subjek' }}
        </p>

        <p>
            <strong>Isi pesan:</strong>
        </p>

        <div style="padding: 16px; background-color: #f8f5f6; border-left: 4px solid #3d141e; white-space: pre-wrap; overflow-wrap: anywhere;">{{ $contactMessage->message }}</div>

        <p style="margin-top: 24px; font-size: 12px; color: #777777;">
            Email notifikasi otomatis dari website portfolio.
        </p>
    </div>
</body>
</html>
