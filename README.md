# World Models Article

This repo contains the source for the interactive article "World Models"

![GitHub Logo](/assets/world_models_card_both.png)
Format: ![World Modles](https://worldmodels.github.io/)

### Article

`draft.md` - main text of the article, in markdown.
`draft_appendix.md` - appendix, in markdown.
`draft_bib.html` - the citations.
`draft_header.html` - start of the document
`index.html` - generated, don't edit this file.

### Requirements

[npm markdown-it](https://www.npmjs.com/package/markdown-it)

[npm markdown-it-katex](https://www.npmjs.com/package/markdown-it-katex)

[npm markdown-it-center-text](https://www.npmjs.com/package/markdown-it-center-text)

### Instructions to Build and Test

Make it such that when you run the command `markdown-it`, both katex and center-text plugings are enabled. I did this by adding 4 lines to `markdown-it.js`

```
  // existing code in markdown-it.js:
  md = require('..')({
    html: !options['no-html'],
    xhtmlOut: false,
    typographer: options.typographer,
    linkify: options.linkify
  });

  // additional 4 lines:
  var mk = require('markdown-it-katex');
  var md_center = require('markdown-it-center-text');
  md.use(mk);
  md.use(md_center);
```

Modify text by editing `draft.md` -- this is where all of the content exists.

Appendix content goes in `draft_appendix.md`. Add bib entries to `draft_bib.html`.

Run `bash make.bash` to build document into `draft.html` and `index.html` (which are identical).

Run `python -m http.server` to serve on the base directory to view `draft.html` in a local browser for debugging.
