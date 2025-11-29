import React, { useState } from 'react';

interface Props {
  onUpload?: (url: string) => void;
}

export default function CloudinaryUpload({ onUpload }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'YOUR_UPLOAD_PRESET'); // zamijeni sa svojim presetom

      const res = await fetch('https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        setImageUrl(data.secure_url);
        if (onUpload) onUpload(data.secure_url);
      } else {
        setError('Upload nije uspio!');
      }
    } catch (err) {
      setError('Greška pri uploadu!');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
      {uploading && <p>Uploadujem...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {imageUrl && (
        <div>
          <img src={imageUrl} alt="Uploadovana slika" style={{ maxWidth: 300 }} />
          <p>URL: {imageUrl}</p>
        </div>
      )}
    </div>
  );
}
