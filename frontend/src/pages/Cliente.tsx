import { useState } from 'react';
import type React from 'react';

import {
  Phone, Mail, MapPin, Clock, Send, CheckCircle2,
  MessageSquare, User, Building,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useData } from '@/context/DataContext';
import { Header } from '@/sections/Header';
import { Footer } from '@/sections/Footer';
import { PageBanner } from '@/components/PageBanner';

function Cliente() {
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setFormError('Nome e telefone são obrigatórios.'); return;
    }
    setSending(true); setFormError('');
    try {
      const res = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, phone: form.phone, email: form.email,
          company: form.company, subject: form.subject,
          message: form.message, segment: form.subject,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Erro ao enviar'); }
      setSent(true);
      setShowDialog(true);
      setForm({ name: '', company: '', email: '', phone: '', subject: '', message: '' });
    } catch (err: any) {
      setFormError(err.message || 'Erro ao enviar. Tente novamente.');
    } finally { setSending(false); }
  };

  const { data } = useData();
  const ct = data.content || {};

  const contatos = [
    { icon: <Phone size={22} />, titulo: ct['contact.phone'] || '(00) 0000-0000', descricao: 'Telefone', info: ct['contact.hours'] || 'Seg–Sex, 8h às 18h' },
    { icon: <Mail size={22} />, titulo: ct['contact.email'] || 'contato@empresa.com.br', descricao: 'E-mail', info: 'Resposta em até 24h' },
    { icon: <MapPin size={22} />, titulo: ct['contact.address'] || 'Seu endereço aqui', descricao: 'Endereço', info: '' },
    { icon: <Clock size={22} />, titulo: ct['contact.hours'] || 'Seg–Sex, 8h às 18h', descricao: 'Horário de atendimento', info: '' },
  ];

  const heroFallback = (
    <section className="relative py-32 bg-[#1d1d1f] overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-600 rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="inline-block px-4 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm font-medium mb-6 border border-orange-500/30">Contato</span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
          Vamos <span className="text-orange-400">conversar?</span>
        </h1>
        <p className="text-xl text-slate-300 max-w-3xl mx-auto">Entre em contato conosco. Nossa equipe está pronta para ajudar você.</p>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <Header />
      <PageBanner page="cliente" fallback={heroFallback} />

      <section className="py-24 bg-[#f5f5f7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Canais de contato */}
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Entre em <span className="text-orange-600">contato</span>
              </h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Preencha o formulário ao lado ou utilize um de nossos canais de atendimento. Retornaremos o mais breve possível.
              </p>
              <div className="space-y-5">
                {contatos.map((c, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="w-11 h-11 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 flex-shrink-0 group-hover:bg-orange-600 group-hover:text-white transition-all">{c.icon}</div>
                    <div>
                      <p className="font-bold text-slate-900">{c.titulo}</p>
                      <p className="text-slate-500 text-sm">{c.descricao}</p>
                      {c.info && <p className="text-sm text-orange-600 font-medium">{c.info}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Formulário */}
            <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-xl border border-slate-200">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Envie uma mensagem</h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome *</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <Input placeholder="Seu nome" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="pl-11 h-11 bg-[#f5f5f7] border-slate-200 focus:border-orange-500 focus:ring-orange-200" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Empresa</label>
                    <div className="relative">
                      <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <Input placeholder="Nome da empresa" value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} className="pl-11 h-11 bg-[#f5f5f7] border-slate-200 focus:border-orange-500 focus:ring-orange-200" />
                    </div>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <Input type="email" placeholder="seu@email.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="pl-11 h-11 bg-[#f5f5f7] border-slate-200 focus:border-orange-500 focus:ring-orange-200" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Telefone *</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <Input placeholder="(00) 00000-0000" required value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="pl-11 h-11 bg-[#f5f5f7] border-slate-200 focus:border-orange-500 focus:ring-orange-200" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Assunto</label>
                  <select value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} className="w-full h-11 px-4 rounded-lg border border-slate-200 bg-[#f5f5f7] text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                    <option value="">Selecione o assunto</option>
                    <option>Quero conhecer as soluções</option>
                    <option>Sou cliente e preciso de suporte</option>
                    <option>Parcerias</option>
                    <option>Outros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mensagem</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-4 text-slate-400" size={16} />
                    <Textarea placeholder="Como podemos ajudar?" value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} className="pl-11 min-h-[130px] bg-[#f5f5f7] border-slate-200 focus:border-orange-500 focus:ring-orange-200" />
                  </div>
                </div>
                {formError && <p className="text-red-600 text-sm px-3 py-2 bg-red-50 rounded-lg border border-red-200">{formError}</p>}
                {sent && !showDialog && <p className="text-green-600 text-sm px-3 py-2 bg-green-50 rounded-lg border border-green-200">✅ Mensagem enviada! Entraremos em contato em breve.</p>}
                <Button type="submit" disabled={sending} className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-base font-semibold shadow-lg shadow-orange-600/25 transition-all">
                  <Send className="mr-2" size={18} />
                  {sending ? 'Enviando...' : 'Enviar Mensagem'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Mensagem Enviada!</DialogTitle>
            <DialogDescription className="text-slate-600">Obrigado pelo contato! Nossa equipe retornará em breve.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="text-green-600" size={32} />
            </div>
          </div>
          <Button onClick={() => setShowDialog(false)} className="w-full bg-orange-600 hover:bg-orange-700 text-white">Fechar</Button>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

export default Cliente;
