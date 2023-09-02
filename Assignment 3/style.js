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
    "z-index": "10"
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
    "overlay-padding": "3px"
  }
}, {
  "selector": "node.magic",
  "style": {
    // your magic lens effects for nodes go here! 
    // See https://js.cytoscape.org/#style for all options
  }
}, {
  "selector": "edge.magic",
  "style": {
    // your magic lens effects for edges go here! 
    // See https://js.cytoscape.org/#style for all options
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
}]

export default _style;