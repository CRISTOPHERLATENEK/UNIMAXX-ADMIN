import { useEffect, useMemo, useState } from 'react';
import type React from 'react';
import { Eye, RotateCcw, Save } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ImageUploadField } from '@/components/ImageUploadField';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { HomeFieldDef, HomeSectionDef } from '@/admin/homeSectionConfigs';

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div>
        <label className="text-xs font-semibold text-[#1d1d1f]">{label}</label>
        {hint && <p className="text-[11px] text-[#98989d] mt-0.5">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function FieldRenderer({
  field,
  value,
  changed,
  onChange,
  onUpload,
  uploading,
}: {
  field: HomeFieldDef;
  value: string;
  changed: boolean;
  onChange: (value: string) => void;
  onUpload: (file: File) => Promise<void>;
  uploading: boolean;
}) {
  const style = {
    borderColor: changed ? '#f97316' : 'rgba(0,0,0,.1)',
    background: changed ? 'rgba(249,115,22,.03)' : undefined,
  };

  if (field.type === 'image') {
    return (
      <Field label={field.label} hint={field.hint}>
        <ImageUploadField
          value={value}
          onChange={onChange}
          onUpload={onUpload}
          uploading={uploading}
          spec={field.spec || { dimensions: 'Livre', formats: 'JPG, PNG, WEBP', maxSize: '2 MB', where: 'Home' }}
          height={170}
        />
      </Field>
    );
  }

  if (field.type === 'toggle') {
    return (
      <div
        className="rounded-2xl border px-4 py-3 flex items-center justify-between"
        style={{
          borderColor: changed ? '#fed7aa' : 'rgba(0,0,0,.06)',
          background: changed ? '#fff7ed' : '#f9fafb',
        }}
      >
        <div>
          <p className="text-sm font-semibold text-[#1d1d1f]">{field.label}</p>
          {field.hint && <p className="text-[11px] text-[#98989d] mt-0.5">{field.hint}</p>}
        </div>
        <Switch checked={value === '1'} onCheckedChange={(checked) => onChange(checked ? '1' : '0')} />
      </div>
    );
  }

  if (field.type === 'textarea') {
    return (
      <Field label={field.label} hint={field.hint}>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={field.rows || 3}
          placeholder={field.placeholder}
          className="rounded-xl resize-none"
          style={style}
        />
      </Field>
    );
  }

  return (
    <Field label={field.label} hint={field.hint}>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder || ''}
        className="rounded-xl"
        style={style}
      />
    </Field>
  );
}

export function HomeSectionModal({
  section,
  trigger,
  onSaved,
}: {
  section: HomeSectionDef;
  trigger: React.ReactNode;
  onSaved?: () => void;
}) {
  const { data, updateContent, uploadImage } = useData();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [edited, setEdited] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  useEffect(() => {
    if (open) setEdited({});
  }, [open, data.content]);

  const values = useMemo(() => ({ ...data.content, ...edited }), [data.content, edited]);
  const changedCount = Object.keys(edited).length;

  const setValue = (key: string, value: string) => {
    const original = data.content?.[key] || '';
    setEdited((prev) => {
      if (value === original) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: value };
    });
  };

  const handleUpload = async (key: string, file: File) => {
    setUploadingKey(key);
    try {
      const url = await uploadImage(file);
      setValue(key, url);
      toast({ title: '✅ Imagem enviada!' });
    } catch {
      toast({ title: 'Erro no upload da imagem', variant: 'destructive' });
    } finally {
      setUploadingKey(null);
    }
  };

  const handleSave = async () => {
    if (!changedCount) {
      setOpen(false);
      return;
    }
    setSaving(true);
    try {
      await updateContent(edited);
      setEdited({});
      setOpen(false);
      onSaved?.();
      toast({ title: `✅ ${section.title} atualizado com sucesso!` });
    } catch {
      toast({ title: `Erro ao salvar ${section.title.toLowerCase()}`, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[920px] p-0 overflow-hidden rounded-[28px]">
        <div className="border-b px-6 py-5 bg-gradient-to-r from-white to-[#fff7ed]" style={{ borderColor: 'rgba(0,0,0,.06)' }}>
          <DialogHeader className="text-left pr-10">
            <DialogTitle className="text-xl font-black text-[#1d1d1f]" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {section.title}
            </DialogTitle>
            <DialogDescription className="text-sm text-[#6b7280]">
              {section.description}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            {changedCount > 0 && (
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-600 bg-orange-50 border border-orange-200 rounded-full px-2.5 py-1.5">
                {changedCount} alteração{changedCount > 1 ? 'ões' : ''}
              </span>
            )}
            <a
              href={section.previewUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold text-[#1d1d1f] hover:bg-[#fafafa] transition-colors"
              style={{ borderColor: 'rgba(0,0,0,.08)' }}
            >
              <Eye className="w-4 h-4" /> Ver seção no site
            </a>
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
          <div className="grid gap-4 md:grid-cols-2">
            {section.fields.map((field) => (
              <div key={field.key} className={field.type === 'textarea' || field.type === 'image' || field.type === 'toggle' ? 'md:col-span-2' : ''}>
                <FieldRenderer
                  field={field}
                  value={values[field.key] || ''}
                  changed={edited[field.key] !== undefined}
                  onChange={(value) => setValue(field.key, value)}
                  onUpload={async (file) => handleUpload(field.key, file)}
                  uploading={uploadingKey === field.key}
                />
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="border-t px-6 py-4 bg-white" style={{ borderColor: 'rgba(0,0,0,.06)' }}>
          <Button variant="outline" onClick={() => setEdited({})} disabled={!changedCount || saving} className="rounded-xl">
            <RotateCcw className="w-4 h-4 mr-2" /> Descartar
          </Button>
          <Button onClick={handleSave} disabled={saving} className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold">
            <Save className="w-4 h-4 mr-2" /> {saving ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
