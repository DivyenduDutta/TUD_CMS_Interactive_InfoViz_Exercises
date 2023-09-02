/* global fetch, cytoscape */
import _style from "/style.js";

// returns true if the point "p" is inside the circle defined by "c" (center) and "r" (radius)
function isInCircle(c, r, p) {
  return Math.pow(p.x - c.x, 2) + Math.pow(p.y - c.y, 2) <= Math.pow(r, 2) 
}

function isNodeFullyContainedInLens(centerOfNode, centerOfMagicLens, radiusOfNode, radiusOfMagicLens){
  //for node to be fully contained in magic lens circle, d + r2 <= r1
  //where d is distance between center of node and magic lens circle
  //r2 is radius of node and r1 is radius of magic lens
  let d = Math.sqrt(Math.pow(centerOfNode.x - centerOfMagicLens.x, 2)+Math.pow(centerOfNode.y - centerOfMagicLens.y, 2));
  return d + radiusOfNode <= radiusOfMagicLens;
}

fetch("data/data.json")
  .then((res) => res.json())
  .then((data) => {
    var lens = document.getElementById("lens");
    var lensFunc = "node-alter";
    var allClasses = [];
    //console.log(d3.brushY());
    setupSliderEventHandling();
    setupSelectEventHandling();
    //retrieveAllClasses();
    const cy = cytoscape({
      container: document.getElementById("cy"),
      style: _style,
      elements: data,
      layout: {
        name: "cola",
        nodeSpacing: 5,
        edgeLength: 200,
        animate: true,
        randomize: false,
        maxSimulationTime: 1500,
      },
    });

    let targets = [];

    cy.on("mousemove", function (e) {
      
      const mouse = { x: e.originalEvent.x, y: e.originalEvent.y };
      //console.log(`Mouse position: [x: ${mouse.x}, y: ${mouse.y}]`);
      cy.startBatch();
      lens.setAttribute("cx", mouse.x-parseInt(lens.getAttribute("r")));
      lens.setAttribute("cy", mouse.y);
      
      cy.nodes().forEach((n) => {
        const node = n.renderedPosition();
        let centerOfNode = {x: node.x, y: node.y};
        let centerOfLens = {x: lens.getAttribute("cx"), y: lens.getAttribute("cy")};
        let radiusOfNode = getRadiusOfNode(n);
        let radiusOfLens = parseInt(lens.getAttribute("r"));
        if(isNodeFullyContainedInLens(centerOfNode, centerOfLens,radiusOfNode, radiusOfLens)) {
          //console.log("in circle");
          if(lensFunc === "node-alter"){
            derenderDescription();
            n.addClass("magic");
          }
          else if(lensFunc === "node-alter-adv"){
            renderDescription();
            if(d3.select(`#node-${n.id()}`).size() <= 0){ //condition to avoid multiple redraws of mini viz
              n.addClass("miniviz");
              renderMiniViz(n, radiusOfNode); 
            }
          }
          else{
            //derenderDescription();
            renderDescription();
            n.outgoers().forEach(function(e){
              if(e.isEdge()){
                e.addClass("magic_otg");
              }
            });
            n.incomers().forEach(function(e){
              if(e.isEdge()){
                e.addClass("magic_incg");
                if(!targets.includes(e.source().id()))
                  targets.push(e.source().id());
              }
            });
            console.log(targets);
          }
        }else{
          if(lensFunc === "node-alter"){
            derenderDescription();
            n.removeClass("magic");
          }
          else if(lensFunc === "node-alter-adv"){
            if(d3.select(`#node-${n.id()}`).size() > 0){ //condition to check that mini viz exists
              n.removeClass("miniviz");
              d3.select(`#node-${n.id()}`).remove();
            }
          }
          else{
            //derenderDescription();
            if(!targets.includes(n.id())){
              n.connectedEdges().forEach(function(e){
                e.removeClass("magic_otg");
                e.removeClass("magic_incg");
              });
           }else{
            targets = targets.filter((id) => id != n.id());
           }
          }
        }
        // console.log(`Node position: [x: ${node.x}, y: ${node.y}]`);
      });
      cy.endBatch();
      
    });

    function renderMiniViz(n, r){
      const mini_viz = document.createElement('div');
      mini_viz.id = `node-${n.id()}`;
      const nodePos = n.renderedPosition();
      mini_viz.style.position = 'absolute';
      mini_viz.style.left = `${(nodePos.x-r)}px`;
      mini_viz.style.top = `${(nodePos.y-r)}px`;
      cy.container().appendChild(mini_viz);
      const nodeDiv = d3.select(`#node-${n.id()}`);

      // Define the dimensions of the bar chart
      const width = 2*r;
      const height = 2*r;
      let outgoingEdgesCount = n.outdegree();
      let incomingEdgesCount = n.indegree();
      let dt = [outgoingEdgesCount,incomingEdgesCount]

      // Create a scale for the x-axis
      const xScale = d3.scaleBand()
      .domain(d3.range(dt.length))
      .range([0, width])
      .padding(0.1);

      // Create a scale for the y-axis
      const yScale = d3.scaleLinear()
      .domain([0, d3.max(dt)])
      .range([height, 0]);

      // Create an SVG element inside the node div
      const svg = nodeDiv.append('svg')
      .attr('width', width)
      .attr('height', height);

      const barColors = d3.scaleOrdinal()
                          .domain(dt.map((d, i) => i))
                          .range(['#CE3931', '#30CF5D']);

      // Create the bars in the bar chart
      svg.selectAll('rect')
      .data(dt)
      .enter()
      .append('rect')
      .attr('x', (d, i) => xScale(i))
      .attr('y', (d) => yScale(d))
      .attr('width', xScale.bandwidth())
      .attr('height', (d) => height - yScale(d))
      .attr('fill', (d, i) => barColors(i));;
    }

    function renderDescription(){
      if(document.getElementById('otg') == undefined){
        const color_desc_root_otg = document.createElement('div');
        color_desc_root_otg.id = 'otg';
        const viz_desc = document.createElement('div');
        viz_desc.textContent = 'Outgoing Edges';
        const color_desc = document.createElement('div');
        color_desc.style.backgroundColor = '#CE3931';
        color_desc.style.width = '15px';
        color_desc.style.height = '15px';
        color_desc_root_otg.appendChild(viz_desc);
        color_desc_root_otg.appendChild(color_desc);
        document.getElementById('color-desc').appendChild(color_desc_root_otg);
      }
      if(document.getElementById('incg') == undefined){
        const color_desc_root_incg = document.createElement('div');
        color_desc_root_incg.id = 'incg';
        const viz_desc_i = document.createElement('div');
        viz_desc_i.textContent = 'Incoming Edges';
        const color_desc_i = document.createElement('div');
        color_desc_i.style.backgroundColor = '#30CF5D';
        color_desc_i.style.width = '15px';
        color_desc_i.style.height = '15px';
        color_desc_root_incg.appendChild(viz_desc_i);
        color_desc_root_incg.appendChild(color_desc_i);
        document.getElementById('color-desc').appendChild(color_desc_root_incg);
      }
    }

    function derenderDescription(){
      if(document.getElementById('otg') != undefined)
        document.getElementById("otg").remove();
      if(document.getElementById('incg') != undefined)
        document.getElementById("incg").remove();
    }

    function getRadiusOfNode(n){
      let radiusOfNode = parseInt(n.style().width)/2;
      return radiusOfNode;
    }

    function setupSliderEventHandling(){
      const lensSlider = document.getElementById("lens-radius-config");
      lensSlider.addEventListener("input", function(e){
        let newLensRadius = e.target.value;
        lens.setAttribute("r", newLensRadius);
      });
    }
    function setupSelectEventHandling(){
      const lensFuncSelector = document.getElementById("lens-func-type");
      lensFuncSelector.addEventListener("change", function(e){
        lensFunc = e.target.value;
      });
    }

    function retrieveAllClasses(){
      data.forEach(d => {
        if(d["group"] === "nodes"){
          let nodeClasses = d["classes"].split(" ");
          nodeClasses.forEach(ncl => {
            if(!(allClasses.includes(ncl))){
              allClasses.push(ncl);
            }
          });
        }
      });
    }
  });
