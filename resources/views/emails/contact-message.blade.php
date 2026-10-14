<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pesan Baru dari Portfolio</title>
</head>
<body style="margin: 0; padding: 24px; font-family: Arial, sans-serif; color: #333333; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; padding: 28px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);">
        <h2 style="margin-top: 0; color: #3d141e; border-bottom: 2px solid #3d141e; padding-bottom: 10px;">
            📬 Pesan Baru dari Website Portfolio
        </h2>

        <p style="font-size: 15px; color: #555555;">
            Kamu menerima pesan baru dari pengunjung melalui formulir Contact website portfolio:
        </p>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee; width: 140px; font-weight: bold; color: #3d141e;">Nama Pengirim:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee; color: #111111;">{{ $contactMessage->name }}</td>
            </tr>
            <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee; font-weight: bold; color: #3d141e;">Email Pengirim:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee; color: #111111;">
                    <a href="mailto:{{ $contactMessage->email }}" style="color: #561c24; text-decoration: underline;">
                        {{ $contactMessage->email }}
                    </a>
                </td>
            </tr>
            <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee; font-weight: bold; color: #3d141e;">Subjek:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee; color: #111111;">
                    {{ $contactMessage->subject ?: '(Tanpa Subjek)' }}
                </td>
            </tr>
            <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #3d141e; vertical-align: top;">Tanggal:</td>
                <td style="padding: 10px 0; color: #555555;">
                    {{ $contactMessage->created_at ? $contactMessage->created_at->format('d M Y, H:i') : now()->format('d M Y, H:i') }} WIB
                </td>
            </tr>
        </table>

        <div style="margin-top: 15px;">
            <p style="margin: 0 0 8px; font-weight: bold; color: #3d141e;">Isi Pesan:</p>
            <div style="padding: 16px; background-color: #fbf7f8; border-left: 4px solid #561c24; border-radius: 4px; font-size: 14px; line-height: 1.7; color: #222222; white-space: pre-wrap; overflow-wrap: anywhere;">{{ $contactMessage->message }}</div>
        </div>

        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 30px 0 15px;">

        <p style="margin: 0; font-size: 12px; color: #888888; text-align: center;">
            Email notifikasi otomatis dari portal portfolio Zidnii Lu'lu Fazsya. Pesan ini juga tersimpan otomatis di Database & Dashboard Admin.
        </p>
    </div>
</body>
</html>
