import { useState } from 'react';

export function MapsEmbed({ url, address, primaryColor }: { url: string; address: string; primaryColor: string }) {
  const [error, setError] = useState(false);
  const isEmbedUrl = url.includes('/maps/embed');
  const mapsLink = address ? `https://www.google.com/maps/search/${encodeURIComponent(address)}` : 'https://maps.google.com';

  if (!isEmbedUrl || error) {
    return (
      <div style={{ borderRadius: 20, border: '1px solid rgba(0,0,0,.08)', overflow: 'hidden', height: 340 }}>
        <div style={{ height: '100%', background: '#f5f5f7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: `${primaryColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          {address && <p style={{ fontFamily: "'DM Sans'", fontWeight: 600, fontSize: 14, color: '#1d1d1f' }}>{address}</p>}
          <p style={{ fontFamily: "'DM Sans'", fontSize: 13, color: '#98989d' }}>
            {error ? 'Mapa indisponível' : 'Configure a URL de embed nas configurações'}
          </p>
          <a href={mapsLink} target="_blank" rel="noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px',
            borderRadius: 999, background: primaryColor, color: '#fff',
            fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 13, textDecoration: 'none',
          }}>Ver no Google Maps</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(0,0,0,.08)', height: 340 }}>
      <iframe src={url} width="100%" height="340" style={{ border: 0, display: 'block' }}
        loading="lazy" title="Localização" allowFullScreen onError={() => setError(true)} />
    </div>
  );
}
