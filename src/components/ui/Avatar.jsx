import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const getInitials = (email = '', name = '') => {
  if (name) {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }
  return email.charAt(0).toUpperCase();
};

export const Avatar = ({ userId, email, displayName, size = 40, className = '' }) => {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!userId) return;
    const { data } = supabase.storage.from('avatars').getPublicUrl(`${userId}.jpg`);
    if (data?.publicUrl) {
      // Check if image actually exists by trying to load it
      const img = new Image();
      img.onload = () => setUrl(data.publicUrl + '?t=' + Date.now());
      img.onerror = () => setUrl(null);
      img.src = data.publicUrl + '?t=' + Date.now();
    }
  }, [userId]);

  // Listen for custom event to refresh avatar
  useEffect(() => {
    const handler = () => {
      if (!userId) return;
      const { data } = supabase.storage.from('avatars').getPublicUrl(`${userId}.jpg`);
      if (data?.publicUrl) setUrl(data.publicUrl + '?t=' + Date.now());
    };
    window.addEventListener('avatar-updated', handler);
    return () => window.removeEventListener('avatar-updated', handler);
  }, [userId]);

  const initials = getInitials(email, displayName);

  if (url) {
    return (
      <img
        src={url}
        alt="avatar"
        style={{ width: size, height: size }}
        className={`rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      className={`rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-bebas text-emerald-400 ${className}`}
    >
      {initials}
    </div>
  );
};

// Resize image client-side before upload (max 200x200)
export const resizeImage = (file, maxSize = 200) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        if (w > h) { h = (maxSize * h) / w; w = maxSize; }
        else { w = (maxSize * w) / h; h = maxSize; }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(resolve, 'image/jpeg', 0.85);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

export const uploadAvatar = async (userId, file) => {
  const blob = await resizeImage(file);
  const { error } = await supabase.storage
    .from('avatars')
    .upload(`${userId}.jpg`, blob, { upsert: true, contentType: 'image/jpeg' });
  if (error) throw error;
  window.dispatchEvent(new Event('avatar-updated'));
};

export const removeAvatar = async (userId) => {
  const { error } = await supabase.storage.from('avatars').remove([`${userId}.jpg`]);
  if (error) throw error;
  window.dispatchEvent(new Event('avatar-updated'));
};
