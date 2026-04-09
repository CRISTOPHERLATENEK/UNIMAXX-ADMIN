import { Phone, Mail, MapPin, Clock, Send, CheckCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import type React from 'react';

import { useData } from '@/context/DataContext';
import { MapsEmbed } from '@/components/MapsEmbed';

// Inject spin keyframe once — <style> inline no JSX causa insertBefore crash
if (typeof document !== 'undefined' && !document.getElementById('contact-spin-style')) {
  const _s = document.createElement('style');
  _s.id = 'contact-spin-style';
  _s.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(_s);
}


export function Contact() {
  const { data } = useData();
  const content  = data.content;
  const settings = data.settings || {};
  const pc = settings.primary_color || '#f97316';
  const sc = settings.secondary_color || '#fb923c';
  const mapsUrl = settings.maps_embed_url || '';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  const [formData, setFormData] = useState({ name: '', phone: '', email: '', segment: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const contactInfo = [
    { icon: Phone,  label: 'Telefone',    value: content['contact.phone']   || '' },
    { icon: Mail,   label: 'E-mail',      value: content['contact.email']   || '' },
    { icon: MapPin, label: 'Endereço',    value: content['contact.address'] || '' },
    { icon: Clock,  label: 'Atendimento', value: content['contact.hours']   || '' },
  ].filter(i => i.value);

  const segmentOptions = ['Moda e Acessórios', 'Alimentação', 'Farmácia', 'Postos de Combustível', 'Supermercado', 'Outros'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Erro ao enviar');
      }
      setSubmitted(true);
      setFormData({ name: '', phone: '', email: '', segment: '', message: '' });
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const inp = (style: React.CSSProperties = {}): React.CSSProperties => ({
    width: '100%', padding: '12px 16px', background: 'var(--s0)',
    border: '1px solid rgba(0,0,0,.1)', borderRadius: 12,
    fontSize: 14, color: 'var(--t1)', outline: 'none',
    fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    ...style,
  });

  return (
    <section id="contato" style={{ padding: '7rem 0', background: 'var(--s0)' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 2rem' }}>

        {/* Header */}
        <div data-reveal="up" style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 16px', borderRadius: 999,
            background: `${pc}12`, border: `1px solid ${pc}28`, marginBottom: 16,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: pc, display: 'inline-block' }} />
            <span style={{ fontFamily: "'DM Sans'", fontSize: 11, fontWeight: 700, color: pc, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Entre em Contato
            </span>
          </div>
          <h2 style={{
            fontFamily: "'Outfit'", fontSize: 'clamp(2rem,4vw,3rem)',
            fontWeight: 900, color: 'var(--t1)', letterSpacing: '-0.03em', lineHeight: 1.08,
          }}>
            {content['contact.title'] || 'Vamos'}{' '}
            <span style={{ color: pc }}>{content['contact.subtitle'] || 'conversar?'}</span>
          </h2>
          <p style={{ fontFamily: "'DM Sans'", fontSize: 15, color: 'var(--t3)', marginTop: 12, maxWidth: 480, margin: '12px auto 0', lineHeight: 1.7 }}>
            {content['contact.description'] || 'Ligamos para você em até 1h. Fale sobre os desafios do seu negócio.'}
          </p>
        </div>

        <div data-stagger style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>

          {/* Left — info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {contactInfo.map(({ icon: Icon, label, value }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '16px 18px', background: 'var(--s2)',
                borderRadius: 16, border: '1px solid transparent',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${pc}20`; (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 16px ${pc}08`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, background: `${pc}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} style={{ color: pc }} />
                </div>
                <div>
                  <p style={{ fontFamily: "'DM Sans'", fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{label}</p>
                  <p style={{ fontFamily: "'DM Sans'", fontSize: 14, fontWeight: 600, color: '#1d1d1f' }}>{value}</p>
                </div>
              </div>
            ))}

            {/* CTA card */}
            <div style={{
              padding: '20px 18px', borderRadius: 16, marginTop: 4,
              background: `linear-gradient(135deg, ${pc}, ${sc})`,
            }}>
              <p style={{ fontFamily: "'Outfit'", fontWeight: 800, fontSize: 16, color: '#fff', marginBottom: 6 }}>
                Resposta em até 1 hora
              </p>
              <p style={{ fontFamily: "'DM Sans'", fontSize: 13, color: 'rgba(255,255,255,.8)', lineHeight: 1.6 }}>
                Nossa equipe está pronta para apresentar a melhor solução para seu negócio.
              </p>
            </div>
          </div>

          {/* Right — form */}
          <div style={{
            background: 'var(--s2)', borderRadius: 24, padding: 'clamp(1.5rem,4vw,2.5rem)',
            border: '1px solid rgba(0,0,0,.06)',
          }}>
            <h3 style={{ fontFamily: "'Outfit'", fontWeight: 800, fontSize: 20, color: 'var(--t1)', marginBottom: 24 }}>
              {content['contact.form.title'] || 'Receba uma ligação'}
            </h3>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%', background: `${pc}12`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                }}>
                  <CheckCircle size={36} style={{ color: pc }} />
                </div>
                <h4 style={{ fontFamily: "'Outfit'", fontWeight: 800, fontSize: 20, color: 'var(--t1)', marginBottom: 8 }}>
                  Mensagem enviada!
                </h4>
                <p style={{ fontFamily: "'DM Sans'", fontSize: 14, color: 'var(--t3)', lineHeight: 1.6, marginBottom: 20 }}>
                  Recebemos seu contato e entraremos em breve.
                </p>
                <button onClick={() => setSubmitted(false)} style={{
                  padding: '10px 24px', borderRadius: 999, border: 'none',
                  background: `${pc}12`, color: pc, cursor: 'pointer',
                  fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 13,
                }}>Enviar outra mensagem</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontFamily: "'DM Sans'", fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
                      Nome *
                    </label>
                    <input style={inp()} placeholder="Seu nome" required value={formData.name}
                      onChange={e => setFormData(p => ({...p, name: e.target.value}))}
                      onFocus={e => { e.target.style.borderColor = pc; e.target.style.boxShadow = `0 0 0 3px ${pc}18`; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,.1)'; e.target.style.boxShadow = 'none'; }} />
                  </div>
                  <div>
                    <label style={{ fontFamily: "'DM Sans'", fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
                      Telefone *
                    </label>
                    <input style={inp()} type="tel" placeholder="(00) 00000-0000" required value={formData.phone}
                      onChange={e => setFormData(p => ({...p, phone: e.target.value}))}
                      onFocus={e => { e.target.style.borderColor = pc; e.target.style.boxShadow = `0 0 0 3px ${pc}18`; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,.1)'; e.target.style.boxShadow = 'none'; }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontFamily: "'DM Sans'", fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>E-mail</label>
                  <input style={inp()} type="email" placeholder="seu@email.com" value={formData.email}
                    onChange={e => setFormData(p => ({...p, email: e.target.value}))}
                    onFocus={e => { e.target.style.borderColor = pc; e.target.style.boxShadow = `0 0 0 3px ${pc}18`; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,.1)'; e.target.style.boxShadow = 'none'; }} />
                </div>

                <div>
                  <label style={{ fontFamily: "'DM Sans'", fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Segmento</label>
                  <select style={{ ...inp(), appearance: 'none' }} value={formData.segment}
                    onChange={e => setFormData(p => ({...p, segment: e.target.value}))}
                    onFocus={e => { (e.target as HTMLElement).style.borderColor = pc; (e.target as HTMLElement).style.boxShadow = `0 0 0 3px ${pc}18`; }}
                    onBlur={e => { (e.target as HTMLElement).style.borderColor = 'rgba(0,0,0,.1)'; (e.target as HTMLElement).style.boxShadow = 'none'; }}>
                    <option value="">Selecione seu segmento</option>
                    {segmentOptions.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ fontFamily: "'DM Sans'", fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Mensagem</label>
                  <textarea style={{ ...inp({ resize: 'none' }), height: 100 }} placeholder="Conte sobre seu negócio..." value={formData.message}
                    onChange={e => setFormData(p => ({...p, message: e.target.value}))}
                    onFocus={e => { e.target.style.borderColor = pc; e.target.style.boxShadow = `0 0 0 3px ${pc}18`; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,.1)'; e.target.style.boxShadow = 'none'; }} />
                </div>

                {error && (
                  <div style={{ padding: '10px 14px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', fontFamily: "'DM Sans'", fontSize: 13, color: '#dc2626' }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '14px', borderRadius: 999, border: 'none', cursor: loading ? 'wait' : 'pointer',
                  background: loading ? '#ccc' : `linear-gradient(135deg, ${pc}, ${sc})`,
                  boxShadow: loading ? 'none' : `0 8px 24px ${pc}35`,
                  color: '#fff', fontFamily: "'DM Sans'", fontWeight: 800, fontSize: 14,
                  transition: 'all 0.2s',
                }}>
                  {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Enviando...</> : <><Send size={15} /> {content['contact.form.submit'] || 'Solicitar Contato'}</>}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Maps */}
        {mapsUrl && (
          <div style={{ marginTop: 40 }}>
            <MapsEmbed url={mapsUrl} address={content['contact.address'] || ''} primaryColor={pc} />
          </div>
        )}
      </div>
    </section>
  );
}
