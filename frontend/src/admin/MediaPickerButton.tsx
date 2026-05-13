import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import MediaLibrary from './MediaLibrary';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace(/\/api\/?$/, '');

interface MediaPickerButtonProps {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  className?: string;
}

export default function MediaPickerButton({ value, onChange, placeholder = 'Nenhuma imagem selecionada', className }: MediaPickerButtonProps) {
  const [open, setOpen] = useState(false);

  const fullUrl = value ? (value.startsWith('http') ? value : `${BASE_URL}${value}`) : '';

  return (
    <>
      <div className={className} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc' }}>
        {fullUrl ? (
          <img src={fullUrl} alt="Selecionada" style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
        ) : (
          <div style={{ width: 44, height: 44, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ImageIcon size={18} style={{ color: '#94a3b8' }} />
          </div>
        )}
        <span style={{ flex: 1, fontSize: 12, color: fullUrl ? '#0f172a' : '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value || placeholder}
        </span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{ height: 32, padding: '0 12px', borderRadius: 8, background: '#f97316', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
          Trocar
        </button>
      </div>

      <MediaLibrary
        open={open}
        onClose={() => setOpen(false)}
        onSelect={url => { onChange(url); setOpen(false); }}
      />
    </>
  );
}
