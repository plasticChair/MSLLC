# Editing the Website

Edit the Markdown files below instead of the HTML. The design stays in the
shared template and stylesheet; Vite generates the finished page from your text.

## Where to Edit

| Content | File |
| --- | --- |
| Business name, browser title, search description, navigation, LinkedIn URL | [content/site.md](content/site.md) |
| Homepage introduction, tagline, landscape image, buttons | [content/hero.md](content/hero.md) |
| Experience numbers and labels | [content/experience.md](content/experience.md) |
| Services section introduction | [content/services.md](content/services.md) |
| Program development service | [content/services/01-programs.md](content/services/01-programs.md) |
| Compliance service | [content/services/02-compliance.md](content/services/02-compliance.md) |
| Team engagement service | [content/services/03-teams.md](content/services/03-teams.md) |
| Biography, photo, caption | [content/about.md](content/about.md) |
| Approach and steps | [content/approach.md](content/approach.md) |
| Contact text, public email, form labels | [content/contact.md](content/contact.md) |
| Inquiry dialog and draft wording | [content/inquiry.md](content/inquiry.md) |
| Privacy statement | [content/privacy.md](content/privacy.md) |

## The Two Parts of a File

The settings at the top are between `---` lines. Change their values, keeping
the field names and indentation. For example, the About file has these settings:

```yaml
heading: Meet Mary Sherman.
image: /images/sherwoman.jpg
image_alt: MS
```

A `|` starts a multiline setting. Headings, taglines, leads, and photo captions
support Markdown emphasis and line breaks:

```yaml
tagline: |
  Thoughtful programs.
  *Meaningful change.*
```

After the second `---`, write normal Markdown paragraphs and lists:

```markdown
I help teams build **stronger programs** and navigate complex requirements.

- Program planning
- Staff training
```

Separate paragraphs with a blank line. Use spaces, not tabs, for indentation in
the settings. Quote a setting containing a colon followed by a space or `#`.
Raw HTML is disabled, so there is no need to write HTML tags.

## Photos and Services

Put new image files in [public/images](public/images). Set the appropriate
`image` field to `/images/your-filename.jpg`. Images that do not exist cause a
clear build error instead of a silently broken picture.

To add a service, copy an existing service Markdown file and give it the next
numbered filename. Change its heading, `inquiry_label`, button label, description,
and bullets. Keep `inquiry_label` unique. Files appear in filename order, and
their inquiry options update automatically. The existing service icons are
`clipboard-list`, `shield-check`, and `users-round`.

## Contact Email

In [content/contact.md](content/contact.md), set `email` to the approved public
address, or leave it as `""` while the address is undecided. `email_placeholder`
is only display text; changing it does not configure message delivery.

The Worker variable `CONTACT_EMAIL`, if valid and nonempty, overrides the
Markdown email on the deployed site. The form still only prepares a draft;
the visitor chooses whether to send it in their email application.

Never put passwords or API keys in Markdown. These files contain public content.

## Preview, Rebuild, and Publish

1. In VS Code, run **Terminal > Run Task > Edit website (live preview)**.
2. Open http://127.0.0.1:5173. Vite prints a different port if that one is busy.
3. Edit a Markdown file and save. The browser refreshes automatically.
4. Press **Ctrl+Shift+B** and choose **Build website** to produce deployment files.
5. Review and commit your intended changes, then push to GitHub. Cloudflare's
   connected build runs the same Markdown rendering during deployment.

For the initial Markdown migration, include the new content and build files,
template, scripts, package manifest, and lockfile in the commit, not only the
Markdown folder. After that, ordinary text updates only require committing the
edited content files and any new images.

If the Worker preview at port 8787 becomes unstyled after a production rebuild,
terminate **Preview Cloudflare Worker** and run it again. Stale asset references
can return 404 until that preview restarts. Use the Vite live preview for editing.