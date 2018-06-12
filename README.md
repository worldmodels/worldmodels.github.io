# World Models Article

This repo contains the source for the interactive article "World Models".

If you are looking for the TensorFlow implementation of the model and experimental setup, please see:

https://github.com/hardmaru/WorldModelsExperiments

![World Models](/assets/world_models_card_both.png)
[World Models Article](https://worldmodels.github.io/)

### Article

`draft.md` - main text of the article, in markdown.

`draft_appendix.md` - appendix, in markdown.

`draft_bib.html` - the citations.

`draft_header.html` - start of the document

`index.html` - generated, don't edit this file.

### Instructions to Build and Test
```bash
git clone https://github.com/worldmodels/worldmodels.github.io.git
cd worldmodels.github.io
npm install
```

Modify text by editing `draft.md` -- this is where all of the content exists.

Appendix content goes in `draft_appendix.md`. Add bib entries to `draft_bib.html`.

Run `./bin/make` to build document into `index.html` (which are identical).
Run `python -m http.server` to serve on the base directory to view `draft.html` in a local browser for debugging.

To watch all markdown files for changes and then compile them, you can run the following
```
brew install fswatch
./bin/watch
```