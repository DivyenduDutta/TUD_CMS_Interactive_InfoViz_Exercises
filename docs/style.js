const _style = [{
  "selector": "core",
  "style": {
    "selection-box-color": "#AAD8FF",
    "selection-box-border-color": "#8BB0D0",
    "selection-box-opacity": "0.5"
  }
}, {
  "selector": "node",
  "style": {
    "width": "mapData(score, 0, 0.006769776522008331, 20, 60)",
    "height": "mapData(score, 0, 0.006769776522008331, 20, 60)",
    "content": "data(name)",
    "font-size": "12px",
    "text-valign": "center",
    "text-halign": "center",
    "background-color": "#555",
    "text-outline-color": "#555",
    "text-outline-width": "2px",
    "color": "#fff",
    "overlay-padding": "6px",
    "z-index": "10",
    "transition-property": "background-color text-outline-color text-outline-width color",
    "transition-duration": "0.3s"
  }
}, {
  "selector": "node:selected",
  "style": {
    "border-width": "6px",
    "border-color": "#AAD8FF",
    "border-opacity": "0.5",
    "background-color": "#77828C",
    "text-outline-color": "#77828C"
  }
}, {
  "selector": "edge",
  "style": {
    "curve-style": "haystack", // bezier, taxi, ...
    "haystack-radius": "0.5",
    "opacity": "0.4",
    "line-color": "#bbb",
    "width": "mapData(weight, 0, 1, 1, 8)",
    "overlay-padding": "3px",
  }
}, {
  "selector": "node.magic",
  "style": {
    "background-color": "#75d97f",
    "text-outline-color": "#75d97f",
    "text-outline-width": "4px",
    "color": "#024ff5",
  }
}, {
  "selector": "edge[group=\"coexp\"]",
  "style": {
    "line-color": "#d0b7d5"
  }
}, {
  "selector": "edge[group=\"coloc\"]",
  "style": {
    "line-color": "#a0b3dc"
  }
}, {
  "selector": "edge[group=\"gi\"]",
  "style": {
    "line-color": "#90e190"
  }
}, {
  "selector": "edge[group=\"path\"]",
  "style": {
    "line-color": "#9bd8de"
  }
}, {
  "selector": "edge[group=\"pi\"]",
  "style": {
    "line-color": "#eaa2a2"
  }
}, {
  "selector": "edge[group=\"predict\"]",
  "style": {
    "line-color": "#f6c384"
  }
}, {
  "selector": "edge[group=\"spd\"]",
  "style": {
    "line-color": "#dad4a2"
  }
}, {
  "selector": "edge[group=\"spd_attr\"]",
  "style": {
    "line-color": "#D0D0D0"
  }
}, {
  "selector": "edge[group=\"reg\"]",
  "style": {
    "line-color": "#D0D0D0"
  }
}, {
  "selector": "edge[group=\"reg_attr\"]",
  "style": {
    "line-color": "#D0D0D0"
  }
}, {
  "selector": "edge[group=\"user\"]",
  "style": {
    "line-color": "#f0ec86"
  }
},{
  "selector": "edge.magic_otg",
  "style": {
    "opacity": "1.0",
    "line-color": "#CE3931",
  }
},{
  "selector": "edge.magic_incg",
  "style": {
    "opacity": "1.0",
    "line-color": "#30CF5D",
  }
},{
  "selector": "node.miniviz",
  "style": {
    "background-color": "#A4CBEC",
    "font-size": "0px"
  }
}]

export default _style;