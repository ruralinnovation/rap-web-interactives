# easy-d3-annotate
Simple annotations for d3 graphics

## [Demo and documentation](https://camdenblatchly.github.io/easy-d3-annotate/)

### Quick Setup

Include [d3](https://d3js.org/) before including your annotation script.

To add `easy-d3-annotate` as a node module run `npm i @camdenblatchly/easy-d3-annotate`.

Here is an example of an annotation definition:

```
let annotation = {
    note: "Boston, MA", // Whatever you want your note to say. Accepts HTML.
    data: [ 
      // The coordinates of the annotation subject go first
      { x: +x(max_cty.pct_ba_higher), y: y(+max_cty.pci) }, 
      // You can optionally define an intermediary point for the line to pass through
      { x: x(0.4), y: y(45000) }, 
      // The coordinates of the annotation note go last
      { x: x(0.42), y: y(35000) }, 
    ], 
    width: 100,
    height: 55, 
    // You can optionally specify an id for CSS styling
    id: 'max-anno',
    // Or a class
    class: 'annotation',
    // Use arrow_offset to offset the position of the arrow from its subject
    arrow_offset: { x: 0, y: dot_radius * 1.5 }, 
    // Specify where the line should connect to the note
    line_start: 'top', 
    // Lines can either have linear (straight) or normal (swoopy) curves 
    curve_type: 'normal'
  }
```    

You can then add your annotation by running `svg.call(addAnnotation, annotation)` at the end of your script.
