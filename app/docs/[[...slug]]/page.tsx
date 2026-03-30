import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { getDocBySlug } from "@/lib/docs";
import React from 'react';

// Genera metadatos para la pagina
export async function generateMetadata(props: { params: Promise<{ slug?: string[] }> }) {
  const params = await props.params;
  const doc = getDocBySlug(params.slug);
  if (!doc) return { title: "Documento no encontrado" };

  return {
    title: doc.data.title || (params.slug ? params.slug.join(" / ") : "Platform Docs"),
  };
}

export default async function DocPage(props: { params: Promise<{ slug?: string[] }> }) {
  const params = await props.params;
  const doc = getDocBySlug(params.slug);

  if (!doc) {
    notFound();
  }

  return (
    <article className="prose prose-stone dark:prose-invert max-w-none w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* 
        Si hay un title en el frontmatter, se renderiza antes del Markdown.
        Si el markdown ya contiene los H1 (# Titulo), entonces es redundante, 
        por lo que podemos decidir si mostrarlo o no basado en preferencias
      */}
      {doc.data.title && (
        <h1 className="mb-8 tracking-tight font-extrabold">{doc.data.title}</h1>
      )}

      {doc.data.description && (
        <p className="text-xl text-muted-foreground mt-0 mb-8 leading-relaxed">
          {doc.data.description}
        </p>
      )}
      
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // Podemos sobreescribir estilos de ciertos componentes
          a: ({ node, ...rest }) => (
            <a {...rest} className="text-primary hover:underline hover:text-primary/80 transition-colors" target={rest.href?.startsWith('http') ? '_blank' : undefined} rel={rest.href?.startsWith('http') ? 'noopener noreferrer' : undefined} />
          ),
          code: ({ node, ...rest }: any) => {
             const isInline = !rest.className;
             return (
               <code 
                 {...rest} 
                 className={`
                    ${rest.className || ''} 
                    ${isInline ? 'bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md font-mono text-sm before:content-[""] after:content-[""]' : ''}
                 `}
               />
             )
          },
          pre: ({ node, ...rest }) => (
            <pre {...rest} className="bg-card text-card-foreground border border-border rounded-lg shadow-sm p-4 overflow-x-auto selection:bg-primary/30" />
          )
        }}
      >
        {doc.content}
      </ReactMarkdown>
    </article>
  );
}
