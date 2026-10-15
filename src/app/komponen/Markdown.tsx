import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

/** Render materi Markdown dengan gaya buku teks. */
export function Markdown({ isi }: { isi: string }) {
  return (
    <div className="prosa">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: ({ className, children }) =>
            className ? <code className={className}>{children}</code> : <code className="kode-sebaris">{children}</code>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {isi}
      </ReactMarkdown>
    </div>
  )
}
