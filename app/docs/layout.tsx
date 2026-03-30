import Link from "next/link";
import { getDocsTree, DocNode } from "@/lib/docs";
import { ChevronRight, FileText, FolderClosed } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";

function renderTree(nodes: DocNode[]) {
  if (!nodes || nodes.length === 0) return null;

  return (
    <ul className="space-y-1">
      {nodes.map((node, index) => {
        if (node.isDir) {
          return (
            <Accordion type="multiple" className="w-full" key={`dir-${node.slug}`}>
              <AccordionItem value={`item-${node.slug}`} className="border-b-0">
                <AccordionTrigger className="py-2 hover:no-underline hover:bg-muted/50 rounded-md px-2 text-sm font-medium transition-colors">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <FolderClosed className="w-4 h-4" />
                    {node.name}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pl-4 pb-0">
                  {node.children ? renderTree(node.children) : null}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          );
        } else {
          return (
            <li key={`file-${node.slug}`}>
              <Link
                href={`/docs/${node.slug}`}
                className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium rounded-md hover:bg-muted/50 transition-colors text-foreground/80 hover:text-foreground"
              >
                <FileText className="w-4 h-4 text-muted-foreground" />
                {node.name}
              </Link>
            </li>
          );
        }
      })}
    </ul>
  );
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const tree = getDocsTree();

  return (
    <div className="flex shrink-0 min-h-screen bg-background relative selection:bg-primary selection:text-primary-foreground">
      {/* Sidebar for Docs */}
      <aside className="w-64 border-r bg-card/50 hidden md:block flex-shrink-0 h-screen sticky top-0 overflow-hidden isolate">
        <ScrollArea className="h-full py-6 pr-4 pl-4">
          <div className="mb-8 px-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="text-primary">{"<"}</span>
              Platform Docs
              <span className="text-primary">{"/>"}</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-1">Guías para Desarrolladores.</p>
          </div>

          <nav className="space-y-4">
            <ul className="space-y-1">
              <li>
                <Link
                  href="/docs"
                  className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium rounded-md hover:bg-muted/50 transition-colors text-foreground/80 hover:text-foreground"
                >
                  <FileText className="w-4 h-4 text-primary" />
                  Inicio (README)
                </Link>
              </li>
            </ul>

            <div>
              <h4 className="px-2 mb-2 text-sm font-semibold tracking-tight text-foreground/60 uppercase">
                Documentos
              </h4>
              {renderTree(tree)}
            </div>
          </nav>
        </ScrollArea>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden p-6 md:p-10 container mx-auto bg-background/50 isolate lg:max-w-4xl max-w-none">
        {children}
      </main>
    </div>
  );
}
