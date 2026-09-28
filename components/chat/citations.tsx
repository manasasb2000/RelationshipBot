import { BookOpen, ExternalLink } from 'lucide-react';
import type { Citation } from '@/lib/guru/types';

export function Citations({ citations }: { citations: Citation[] }) {
  if (!citations.length) return null;
  return (
    <details className="citations">
      <summary>
        <BookOpen size={14} /> {citations.length} {citations.length === 1 ? 'source' : 'sources'}
      </summary>
      <ol>
        {citations.map((citation, index) => (
          <li id={`source-${citation.id}`} key={citation.id}>
            <span className="citation-index">{index + 1}</span>
            <div>
              <strong>{citation.title}</strong>
              <small>
                {citation.source} · {citation.license} · chunk {citation.chunkId}
              </small>
              {citation.url && (
                <a href={citation.url} target="_blank" rel="noopener noreferrer">
                  Open source <ExternalLink size={12} />
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>
    </details>
  );
}
