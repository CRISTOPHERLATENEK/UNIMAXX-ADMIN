import React from 'react';
import type { PageBlock } from '@/types';
import { BlockRenderer } from '@/pages/BlockRenderer';
import { DEFAULT_T } from '@/pages/BlockRenderer';

export function PreviewPane({ blocks }: { blocks: PageBlock[] }) {
  return (
    <div className="flex-1 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
        <h3 className="text-sm font-semibold text-gray-900">Preview do Site</h3>
        <p className="text-xs text-gray-500 mt-1">Visualize como ficará no site público</p>
      </div>

      <div className="bg-gray-50">
        {blocks.length === 0 ? (
          <div className="flex items-center justify-center h-96 text-center px-6">
            <div>
              <p className="text-sm text-gray-500 mb-2">Nenhum bloco adicionado</p>
              <p className="text-xs text-gray-400">Adicione blocos para ver a pré-visualização</p>
            </div>
          </div>
        ) : (
          <div className="bg-white">
            {blocks.map((block, idx) => (
              <React.Fragment key={block.id || idx}>
                <BlockRenderer block={block} t={DEFAULT_T} />
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}