import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const docsDirectory = path.join(process.cwd(), 'docs');
const rootREADME = path.join(process.cwd(), 'README.md');

export type DocNode = {
  name: string;
  slug: string;
  isDir: boolean;
  children?: DocNode[];
  order?: number;
};

// Obtiene la estructura del directorio docs/
export function getDocsTree(dirPath: string = docsDirectory, currentSlug: string = ''): DocNode[] {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const fileNames = fs.readdirSync(dirPath);

  const nodes = fileNames
    .filter((fileName) => !fileName.startsWith('.'))
    .map((fileName) => {
      const fullPath = path.join(dirPath, fileName);
      const isDir = fs.statSync(fullPath).isDirectory();

      // Quitamos la extension .md para el slug y el nombre
      const nameWithoutExt = fileName.replace(/\.md$/, '');
      const slug = currentSlug ? `${currentSlug}/${nameWithoutExt}` : nameWithoutExt;

      if (isDir) {
        return {
          name: fileName,
          slug,
          isDir: true,
          children: getDocsTree(fullPath, slug),
        };
      } else if (fileName.endsWith('.md')) {
        // Obtenemos un posible order en el frontmatter
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data } = matter(fileContents);
        return {
          name: data.title || nameWithoutExt,
          slug,
          isDir: false,
          order: data.order || 999,
        };
      }
      return null;
    })
    .filter(Boolean) as DocNode[];

  // Ordenamos los nodos: las carpetas al final, o por order
  return nodes.sort((a, b) => {
    if (a.isDir && !b.isDir) return 1;
    if (!a.isDir && b.isDir) return -1;
    if (!a.isDir && !b.isDir) {
      return (a.order || 999) - (b.order || 999);
    }
    return a.name.localeCompare(b.name);
  });
}

// Obtiene el contenido de un documento Markdown
export function getDocBySlug(slugArray: string[] = []): { content: string; data: { [key: string]: any } } | null {
  try {
    let fullPath;
    
    // Si la ruta es `/docs` vacía, cargamos el README principal
    if (slugArray.length === 0) {
      fullPath = rootREADME;
    } else {
      const relativePath = `${slugArray.join('/')}.md`;
      fullPath = path.join(docsDirectory, relativePath);
    }

    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      content,
      data,
    };
  } catch (error) {
    console.error(`Error reading doc slug: ${slugArray.join('/')}`, error);
    return null;
  }
}
