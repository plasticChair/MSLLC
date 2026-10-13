import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Handlebars from 'handlebars';
import MarkdownIt from 'markdown-it';
import frontMatter from 'markdown-it-front-matter';
import { parse as parseYaml } from 'yaml';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const contentDirectory = path.join(projectRoot, 'content');
const inlineMarkdown = new MarkdownIt({ html: false, breaks: true });
const inlineFields = new Set(['heading', 'title', 'tagline', 'lead', 'caption']);
const templates = Handlebars.create();
templates.registerHelper('number', (index) => String(index + 1).padStart(2, '0'));
templates.registerHelper('mailto', (email) => `mailto:${encodeURIComponent(email)}`);
const virtualId = 'virtual:site-content';
const resolvedVirtualId = `\0${virtualId}`;

function enrich(value) {
  if (Array.isArray(value)) return value.map(enrich);
  if (!value || typeof value !== 'object') return value;
  const result = {};
  for (const [key, entry] of Object.entries(value)) {
    result[key] = enrich(entry);
    if (inlineFields.has(key) && typeof entry === 'string') {
      result[`${key}_html`] = inlineMarkdown.renderInline(entry.trim());
    }
    if (key === 'email' && typeof entry === 'string' && entry && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entry)) {
      throw new Error('Invalid public email address. Use a valid address or leave email empty.');
    }
    if ((key.endsWith('_href') || key.endsWith('_url') || key === 'href') && typeof entry === 'string') {
      if (!/^(https?:\/\/|mailto:|#[\w-]+$|\/(?!\/))/.test(entry)) {
        throw new Error(`Invalid link in "${key}": use https://, mailto:, /path, or #section.`);
      }
    }
  }
  return result;
}

export function parseContent(source, filename = 'content.md') {
  try {
    let metadata;
    const markdown = new MarkdownIt({ html: false });
    markdown.use(frontMatter, (header) => {
      metadata = parseYaml(header);
    });
    const bodyHtml = markdown.render(source);
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
      throw new Error('Start the file with a YAML settings block between --- lines.');
    }
    if (typeof metadata.image === 'string') {
      const imagePath = path.resolve(projectRoot, 'public', `.${metadata.image}`);
      const imagesRoot = path.join(projectRoot, 'public', 'images') + path.sep;
      if (!metadata.image.startsWith('/images/') || !imagePath.startsWith(imagesRoot) || !existsSync(imagePath)) {
        throw new Error(`Image not found: ${metadata.image}. Put the image in public/images.`);
      }
    }
    return { ...enrich(metadata), body_html: bodyHtml };
  } catch (error) {
    throw new Error(`${filename}: ${error.message}`, { cause: error });
  }
}

function readContent(filename) {
  return parseContent(readFileSync(filename, 'utf8'), path.relative(projectRoot, filename));
}

export function loadContent(directory = contentDirectory) {
  const content = {};
  for (const entry of readdirSync(directory, { withFileTypes: true }).sort((first, second) => first.name.localeCompare(second.name))) {
    if (entry.isFile() && entry.name.endsWith('.md')) {
      content[path.basename(entry.name, '.md')] = readContent(path.join(directory, entry.name));
    } else if (entry.isDirectory()) {
      content[`${entry.name}_items`] = readdirSync(path.join(directory, entry.name))
        .filter((name) => name.endsWith('.md'))
        .sort()
        .map((name) => readContent(path.join(directory, entry.name, name)));
    }
  }
  return content;
}

export function renderPage(template, content = loadContent()) {
  return templates.compile(template, { strict: true })(content);
}

export function markdownContentPlugin() {
  return {
    name: 'markdown-site-content',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => renderPage(html),
    },
    resolveId(id) {
      if (id === virtualId) return resolvedVirtualId;
    },
    load(id) {
      if (id !== resolvedVirtualId) return;
      const content = loadContent();
      return `export default ${JSON.stringify({ site: content.site, inquiry: content.inquiry, contact: { email: content.contact.email } })};`;
    },
    configureServer(server) {
      server.watcher.add(contentDirectory);
      const reloadContent = (filename) => {
        const relativePath = path.relative(contentDirectory, path.resolve(filename));
        if (relativePath.startsWith(`..${path.sep}`) || path.isAbsolute(relativePath) || !filename.endsWith('.md')) return;
        const module = server.moduleGraph.getModuleById(resolvedVirtualId);
        if (module) server.moduleGraph.invalidateModule(module);
        server.ws.send({ type: 'full-reload', path: '*' });
      };
      server.watcher.on('add', reloadContent);
      server.watcher.on('change', reloadContent);
      server.watcher.on('unlink', reloadContent);
    },
  };
}