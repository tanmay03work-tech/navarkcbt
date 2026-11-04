import React, { useMemo } from 'react';
import { normalizeExamText, parseMarkdownTable } from '@/utils/examText';

interface FormattedExamTextProps {
  text: string;
  className?: string;
}

export const FormattedExamText: React.FC<FormattedExamTextProps> = ({ text, className = '' }) => {
  const blocks = useMemo(() => {
    if (!text) return [];

    // Split text into table and non-table blocks
    const lines = text.split('\n');
    const result: Array<{ type: 'text' | 'table'; content: string; tableData?: { headers: string[]; rows: string[][] } }> = [];
    let currentTextBlock: string[] = [];
    let currentTableBlock: string[] = [];
    let inTable = false;

    for (const line of lines) {
      const isTableRow = line.trim().startsWith('|') && line.trim().endsWith('|');

      if (isTableRow) {
        if (!inTable) {
          if (currentTextBlock.length > 0) {
            result.push({ type: 'text', content: currentTextBlock.join('\n') });
            currentTextBlock = [];
          }
          inTable = true;
        }
        currentTableBlock.push(line);
      } else {
        if (inTable) {
          const parsed = parseMarkdownTable(currentTableBlock.join('\n'));
          if (parsed && parsed.headers.length > 0) {
            result.push({ type: 'table', content: currentTableBlock.join('\n'), tableData: parsed });
          } else {
            result.push({ type: 'text', content: currentTableBlock.join('\n') });
          }
          currentTableBlock = [];
          inTable = false;
        }
        currentTextBlock.push(line);
      }
    }

    if (inTable && currentTableBlock.length > 0) {
      const parsed = parseMarkdownTable(currentTableBlock.join('\n'));
      if (parsed && parsed.headers.length > 0) {
        result.push({ type: 'table', content: currentTableBlock.join('\n'), tableData: parsed });
      } else {
        result.push({ type: 'text', content: currentTableBlock.join('\n') });
      }
    } else if (currentTextBlock.length > 0) {
      result.push({ type: 'text', content: currentTextBlock.join('\n') });
    }

    return result;
  }, [text]);

  return (
    <div className={`space-y-3 ${className}`}>
      {blocks.map((block, bIdx) => {
        if (block.type === 'table' && block.tableData) {
          const { headers, rows } = block.tableData;
          return (
            <div key={bIdx} className="my-3 overflow-x-auto rounded-lg border border-[#E7DCD3] shadow-xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FFFBF5] text-[#481D1A] font-bold border-b border-[#E7DCD3]">
                  <tr>
                    {headers.map((h, hIdx) => (
                      <th key={hIdx} className="py-2.5 px-4 font-bold border-r border-[#E7DCD3] last:border-r-0">
                        {normalizeExamText(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7DCD3]/60 bg-white">
                  {rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-[#FFFBF5]/40 transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="py-2.5 px-4 font-medium border-r border-[#E7DCD3] last:border-r-0">
                          {normalizeExamText(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        const normalized = normalizeExamText(block.content);
        return (
          <p key={bIdx} className="whitespace-pre-line leading-relaxed">
            {normalized}
          </p>
        );
      })}
    </div>
  );
};

