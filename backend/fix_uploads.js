/**
 * fix_uploads.js — Executa UMA VEZ para renomear arquivos sem extensão
 * que já existem na pasta uploads.
 *
 * Uso: node fix_uploads.js
 * Execute a partir da pasta backend/
 */

const path = require('path');
const fs   = require('fs');

async function run() {
  // file-type v17+ é ESM puro — importa o módulo completo e testa os nomes possíveis
  const ft = await import('file-type');
  const fromBuffer = ft.fileTypeFromBuffer || ft.fromBuffer || ft.default?.fileTypeFromBuffer || ft.default?.fromBuffer;

  if (!fromBuffer) {
    console.error('Não foi possível carregar fileTypeFromBuffer. Verifique a versão do pacote file-type.');
    process.exit(1);
  }

  const UPLOAD_DIR = path.resolve(__dirname, 'uploads');
  const MIME_TO_EXT = { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp' };

  const files = fs.readdirSync(UPLOAD_DIR);
  let fixed = 0, skipped = 0, failed = 0;

  for (const file of files) {
    const filePath = path.join(UPLOAD_DIR, file);
    if (fs.statSync(filePath).isDirectory()) continue;

    const ext = path.extname(file).toLowerCase();
    if (ext) { skipped++; continue; }   // já tem extensão → ok

    try {
      const buffer = fs.readFileSync(filePath);
      const type   = await fromBuffer(buffer);

      if (!type || !MIME_TO_EXT[type.mime]) {
        console.warn(`[SKIP] ${file} — tipo desconhecido ou não suportado`);
        skipped++;
        continue;
      }

      const newName = file + MIME_TO_EXT[type.mime];
      const newPath = path.join(UPLOAD_DIR, newName);
      fs.renameSync(filePath, newPath);
      console.log(`[OK]   ${file}  →  ${newName}`);
      fixed++;
    } catch (e) {
      console.error(`[ERRO] ${file}: ${e.message}`);
      failed++;
    }
  }

  console.log(`\nConcluído: ${fixed} renomeados, ${skipped} ignorados, ${failed} erros.`);
}

run().catch(console.error);