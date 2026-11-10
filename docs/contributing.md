---
summary: How to write the Pokémon Studio documentation.
status: validated
last_reviewed: 2026-11-08
---

# Contributing to the documentation

This guide explains how to write the Pokémon Studio documentation. It is intended for anyone contributing to Pokémon Studio, whether they are developers, designers, or translators.

For how to read the documentation, see the [home page](README.md). For the guidelines specific to design pages, see the [design guidelines](design/contributing.md).

## When to document

Documentation is part of the work itself: it is written alongside the changes it describes. A pull request that adds or changes a behavior must therefore include its documentation.

Documentation left for later falls behind, and stops being a reference.

## Keep the documentation reliable

Readers rely on the documentation as the reference: everything it states without reservation must be true, and everything still open must say so.

### State what is settled

State as fact only what is settled, not what is still under discussion.

When you document an existing behavior, check what you write against its sources, such as Pokémon Studio itself, its issues, or the existing documentation.

Create a page or a section only when there is **real content** for it, never to fill a gap or for symmetry with another part of the documentation.

The progress of the work does not belong in the documentation: priorities and the state of the work are tracked in [GitHub issues](https://github.com/PokemonWorkshop/PokemonStudio/issues). You can still link to an issue next to what is still open, and only there.

### Flag what is still open

Flag what is still open, such as an unanswered question or an idea, in a short section next to the topic it concerns. We recommend using these headings:

- **Open questions**: points that remain to be decided, each with a link to its issue, if there is one.
- **Ideas**: possible directions or improvements, with no commitment.

Other headings are possible when the subject needs them. When a question is answered or an idea is adopted, write the outcome into the relevant part of the page and remove the entry.

## Help readers find their way around

Where a page sits and how it is named tell readers what it covers, and how far it applies.

### Choose the right location

The documentation lives in `docs/`, with one top-level folder per discipline:

| Folder | Content |
| --- | --- |
| `design/` | Product and functional design |
| `engineering/` | Technical documentation |
| `localization/` | Translation and localization |

Each discipline maintains its own folder and follows this guide. A folder can add guidelines specific to its pages in its own `contributing.md`.

Place each piece of information at the **nearest common ancestor** of the pages it applies to: the highest level where it is true for everything below it. For example, a rule for every design page belongs in `design/`, not at the root of `docs/`. Do not create a `common/` folder for shared rules; keep them next to the folders they apply to.

A page's location states its scope. When the scope of a subject grows, move its page up to the new common ancestor and update the links to it.

### Name and organize pages

A file's name states its subject. Write file and folder names in lowercase **kebab-case**. For example, `visual-scripting.md`.

Use a single file when a subject reads well as one page, and a folder when it covers several related subjects, each with its own page. Each folder has a `README.md` that introduces it and leads to its pages.

When a page becomes too dense, split it by subject. This way, the documentation grows by adding pages, without reorganizing what already exists.

## Avoid repetition and ambiguity

The documentation must never contradict itself, or leave readers unsure of what a word means.

### Write each fact once

Write each piece of information in one place only, and link to it from the other pages that need it. A fact written twice eventually diverges: one copy is updated, the other is not, and readers can no longer tell which one is true. For where that place is, see [Choose the right location](#choose-the-right-location).

### Use one name per concept

Use one name per concept, and one concept per name, across all pages. When one word covers two things, or two words cover the same thing, readers cannot tell whether two sentences are about the same subject.

Define each term once, in the pages of the part it belongs to, and link to that definition rather than defining the term again. For the most common terms, link to the [glossary](glossary.md).

The documentation is the reference for names. When Pokémon Studio uses a different name for something, keep the documented name and report the difference in an issue.

## Write a page

Every page follows the same template and the same conventions, whatever its discipline.

### Start from the template

Each page starts with its front matter, followed by its title:

```markdown
---
summary: One sentence that says what the page covers.
status: draft
last_reviewed: YYYY-MM-DD
---

# Page title
```

There is no fixed structure: organize each page around its subject, starting with what it is and what it is for.

Link related resources next to the content they support, including the matching documentation in another discipline.

### Writing conventions

- Write in US English.
- Give every page one clear subject.
- Add descriptive headings that say what each section covers.
- Keep paragraphs short, one point each, and state facts without ambiguity.
- Name the subject explicitly rather than relying on vague references such as "it" or "this one".
- Define acronyms on first use.
- Write headings and names in sentence case, except proper names and the names of Pokémon Studio features, which capitalize each word. For example, Event Builder.
- Write dates in ISO format.

## Before submitting

Before opening a pull request, check that:

- each added or changed behavior is documented;
- each page is in the right folder;
- each page states as fact only what is settled, and flags what is still open;
- no fact is written in two places;
- internal links and image paths work;
- each page has the right status, and `last_reviewed` is up to date.

A page's status is `validated` or `draft`, as described in [How to read a page](README.md#how-to-read-a-page). A page becomes `validated` once a pull request accepts its content as settled. It stays validated as it evolves, since each change is reviewed in its own pull request.

Update `last_reviewed` whenever you change a page, or whenever you confirm that its content is still accurate.

A minor correction, such as a typo or a broken link, only needs a quick review.
