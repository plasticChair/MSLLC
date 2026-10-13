import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import Handlebars from 'handlebars';
import { loadContent, parseContent, renderPage } from '../build/content.js';

test('Markdown settings, emphasis, paragraphs, and lists render without HTML editing', () => {
  const content = parseContent('---\nheading: "Care with *purpose*"\n---\n\nA **strong** program.\n\n- Planning\n- Support\n');
  assert.equal(content.heading_html, 'Care with <em>purpose</em>');
  assert.ok(content.body_html.includes('<strong>strong</strong>'));
  assert.ok(content.body_html.includes('<li>Support</li>'));
});

test('raw HTML and unsafe Markdown links cannot introduce executable markup', () => {
  const content = parseContent('---\nheading: "<script>alert(1)</script>"\n---\n\n<script>alert(1)</script>\n\n[bad](javascript:alert(1))');
  assert.ok(!content.heading_html.includes('<script>'));
  assert.ok(!content.body_html.includes('<script>'));
  assert.ok(!content.body_html.includes('href="javascript:'));
});

test('invalid YAML, missing settings, unsafe links, and missing images fail clearly', () => {
  assert.throws(() => parseContent('---\nheading: [\n---\n', 'broken.md'), /broken\.md:/);
  assert.throws(() => parseContent('Just a paragraph.'), /YAML settings block/);
  assert.throws(() => parseContent('---\nprimary_href: "javascript:alert(1)"\n---\n'), /Invalid link/);
  assert.throws(() => parseContent('---\nimage: /images/missing-test-image.jpg\n---\n'), /Image not found/);
});

test('page template renders real Markdown content and escapes ordinary metadata', () => {
  const template = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const content = loadContent();
  const html = renderPage(template, content);
  assert.ok(html.includes(Handlebars.escapeExpression(content.hero.eyebrow)));
  assert.ok(html.includes(content.hero.tagline_html));
  assert.ok(!html.includes('{{hero.'));
  assert.equal(renderPage('{{hero.eyebrow}}', { hero: { eyebrow: '<b>Not HTML</b>' } }), '&lt;b&gt;Not HTML&lt;/b&gt;');
  assert.equal(typeof content.hero.body_html, 'string');
});

test('service files generate matching article links and contact options automatically', () => {
  const template = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const content = loadContent();
  const extraService = { ...content.services_items[0], inquiry_label: 'An additional service', heading_html: 'An additional service' };
  content.services_items.push(extraService);
  const html = renderPage(template, content);
  for (const service of content.services_items) {
    const label = Handlebars.escapeExpression(service.inquiry_label);
    assert.ok(html.includes(`data-service="${label}"`));
    assert.ok(html.includes(`<option value="${label}">${label}</option>`));
  }
});

test('public email can be configured in Markdown and is safely encoded in links', () => {
  const template = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const content = loadContent();
  content.contact.email = 'mary+website@example.com';
  const html = renderPage(template, content);
  assert.ok(html.includes('href="mailto:mary%2Bwebsite%40example.com"'));
  assert.throws(() => parseContent('---\nemail: not-an-email\n---\n'), /Invalid public email/);
});