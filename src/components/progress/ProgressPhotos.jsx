import { useState } from 'react';
import { Camera, Upload, Trash2, Calendar } from 'lucide-react';

export const ProgressPhotos = ({ photos = [], onUpload, onDelete }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [uploadType, setUploadType] = useState('front');
  const [caption, setCaption] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In real app, upload to Supabase Storage
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpload({
          photo_url: reader.result,
          photo_type: uploadType,
          caption: caption,
          taken_at: new Date().toISOString()
        });
        setCaption('');
      };
      reader.readAsDataURL(file);
    }
  };

  const groupedPhotos = photos.reduce((acc, photo) => {
    const date = new Date(photo.taken_at).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(photo);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="glass-panel p-6 border border-emerald-500/20">
        <div className="flex items-center gap-3 mb-4">
          <Camera className="text-emerald-500" size={20} />
          <h3 className="font-bebas text-xl text-white">ADD PROGRESS PHOTO</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="font-mono-tech text-[9px] text-neutral-500 uppercase block mb-2">Photo Type</label>
            <select
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value)}
              className="w-full bg-neutral-900 border border-white/10 p-3 font-mono-tech text-xs text-white focus:border-emerald-500 outline-none"
            >
              <option value="front">Front</option>
              <option value="back">Back</option>
              <option value="side">Side</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="font-mono-tech text-[9px] text-neutral-500 uppercase block mb-2">Caption (Optional)</label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g., 'After 8 weeks'"
              className="w-full bg-neutral-900 border border-white/10 p-3 font-mono-tech text-xs text-white focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="flex items-end">
            <label className="w-full cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="w-full py-3 bg-emerald-500 text-black font-mono-tech text-xs font-bold uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center gap-2">
                <Upload size={14} />
                Upload Photo
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Photo Timeline */}
      <div className="space-y-8">
        {Object.keys(groupedPhotos).sort((a, b) => new Date(b) - new Date(a)).map(date => (
          <div key={date} className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar size={16} className="text-neutral-500" />
              <h4 className="font-mono-tech text-xs text-neutral-400 uppercase tracking-widest">{date}</h4>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {groupedPhotos[date].map((photo, idx) => (
                <div
                  key={photo.id || idx}
                  className="group relative aspect-square bg-neutral-900 border border-white/10 hover:border-emerald-500/50 transition-all cursor-pointer overflow-hidden"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img
                    src={photo.photo_url}
                    alt={photo.caption || photo.photo_type}
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                    <span className="font-mono-tech text-xs text-emerald-500 uppercase">{photo.photo_type}</span>
                    {photo.caption && (
                      <span className="font-mono-tech text-[9px] text-white text-center">{photo.caption}</span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this photo?')) onDelete(photo.id);
                      }}
                      className="mt-2 p-2 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {photos.length === 0 && (
          <div className="text-center py-20 border border-dashed border-white/10">
            <Camera className="mx-auto text-neutral-600 mb-4" size={48} />
            <p className="font-mono-tech text-xs text-neutral-500">NO PROGRESS PHOTOS YET</p>
            <p className="font-mono-tech text-[9px] text-neutral-600 mt-2">Upload your first photo above</p>
          </div>
        )}
      </div>

      {/* Full Screen Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-8"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedPhoto.photo_url}
              alt={selectedPhoto.caption}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            <div className="mt-4 text-center">
              <span className="font-mono-tech text-sm text-emerald-500 uppercase">{selectedPhoto.photo_type}</span>
              {selectedPhoto.caption && (
                <p className="font-mono-tech text-xs text-neutral-400 mt-2">{selectedPhoto.caption}</p>
              )}
              <p className="font-mono-tech text-[9px] text-neutral-600 mt-2">
                {new Date(selectedPhoto.taken_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
