var d3; // Minor workaround to avoid error messages in editors
console.log(d3);

// Waiting until document has loaded
window.onload = () => {
  d3.json("data/football.json").then(function(data) {
 
    const DEFAULT_COLOR_ENC_ATTR = "appearance";
    
    // initial arrays of attributes to display on axes of the PCP
    let attributes = ['appearance', 'mins_played', 'ball_recovery', 'challenge_lost', 'touches',
                    'clearance_total', 'dispossessed', 'dribble_lost', 'red_card', 'keeper_save_total'];
    let allAttributes = getAttributes();
    //console.log(attributes);

    //define the dimensions of the PCP axes
    let margin = ({top: 30, right: 30, bottom: 30, left: 30});
    let width = 1500;
    let height = 600;
    let brushWidth = 20;
    const NUMBER_OF_AXES = 10;
    let keyz = DEFAULT_COLOR_ENC_ATTR;
  
    let selections = new Map();
    let dragging = {};

    const tickDistMap = returnAttributeTickDistance();

    setupDescPopup();
    
    //populate missing attributes for each player with undefined
    populateMissingAttributes();

    //setup the color encoding data attribute dropdown
    setupColorEncodingDropdown();

    //setup the dropdowns to select attributes for various axes
    setupAttributeSelectionDropdowns();

    //console.log(data);
    
    //map the attributes of the dataset to a continous scale 
    let x_axis = build_x_axis() 
    //console.log(x_axis);

    //build a continous scale using the min and max value of each attribute from the dataset 
    let y_axis = build_y_axis();
    
    //console.log(y_axis);
    let colors = d3.interpolatePuOr;
    let deselectedColor = "#ddd";
    let highlight = d3.scaleSequential(y_axis.get(keyz).domain(), colors);
    
    let polyline = build_polyline(x_axis, y_axis); 
    
    //let label = d => d["label"];
    let label = build_label_for_polyline();

    const brush = d3.brushY()
        .extent([
          [-(brushWidth / 2), margin.top],
          [brushWidth / 2, height - margin.bottom]
        ])
        .on("start brush end", function(event, attr){
          brushed(event.selection, attr, event);
        });

    //build the Parallel Coordinates Plot
    var svgRef = buildPCP(attributes, width, height, margin, highlight, polyline, 
                          keyz, label, x_axis, y_axis, brush);
    var pathRef = svgRef.selectAll("path").filter((d) => d != null);
    //console.log(pathRef.data());
    
    function colorEncodingChangeEventHandler() {
      const colorEncodingDropdown = d3.select("#color-encoding");

      //event handler for anytime the user selects a different data attribute from the dropdown
      colorEncodingDropdown.on("change-attribute", () => {
        //console.log(colorEncodingDropdown.property("attribute-changed-to"));
        keyz = colorEncodingDropdown.property("attribute-changed-to");

        selections = new Map(); //reset the selections manually since its not a part of brush's internal reset
        let updatedHighlight = d3.scaleSequential(y_axis.get(keyz).domain(), colors);

        d3.select("svg").remove();
        let apolyline = build_polyline(x_axis, y_axis);
        svgRef = buildPCP(attributes, width, height, margin, updatedHighlight, apolyline,
          keyz, label, x_axis, y_axis, brush);
        pathRef = svgRef.selectAll("path").filter((d) => d != null);
      });
    }

    function attributeChangeEventHandler() {
      attributes.forEach(attr => {
        const axisAttributeDropdown = d3.select(`#axis-attribute-${attr}`);
        //event handler for anytime user changes attribute for an axis
        axisAttributeDropdown.on("change-axis-attribute", () => {
          let selectedAttribute = axisAttributeDropdown.property("axis-attribute-changed-to");

          // replace replaced attribute with the selected attribute in array
          attributes = attributes.map(el => (el === attr ? selectedAttribute : el));
          keyz = selectedAttribute;
          console.log(`invoking ${attr} -> ${selectedAttribute}`);
          //console.log(attributes);
          x_axis = build_x_axis();
          y_axis = build_y_axis();

          selections = new Map(); //reset the selections manually since its not a part of brush's internal reset
          let updatedHighlight = d3.scaleSequential(y_axis.get(selectedAttribute).domain(), colors);

          d3.select("svg").remove();
          let apolyline = build_polyline(x_axis, y_axis);
          let label = build_label_for_polyline();
          svgRef = buildPCP(attributes, width, height, margin, updatedHighlight, apolyline,
            selectedAttribute, label, x_axis, y_axis, brush);
          pathRef = svgRef.selectAll("path").filter((d) => d != null);
          // rebuild the axis dropdowns
          d3.select("#attribute-selection-root").remove();
          setupAttributeSelectionDropdowns();
          
          //rebuild the color encoding dropdown
          d3.select("#color-encoding").remove();
          setupColorEncodingDropdown();
        });

      });
    }

    function brushed(selection, key, event) {
      event.sourceEvent.stopPropagation();
      //console.log(y_axis.get(key));
      if (selection === null) 
        selections.delete(key);
      else 
        selections.set(key, selection.map(y_axis.get(key).invert));
      
      //console.log(selections);
      const selected = [];
      
      pathRef.each(function(d) {
        const active = Array.from(selections).every(([key, [min, max]]) => d[key] >= min && d[key] <= max);
        const brushHighlight = d3.scaleSequential(y_axis.get(keyz).domain(), colors);
        d3.select(this).attr("stroke", active ? brushHighlight(d[keyz]) : deselectedColor)
          .on("mouseover", function(d){
            d3.select(this).attr("stroke-width", 6);
            d3.select(this).attr("stroke-opacity", 2);
            d3.select(this).attr("stroke", "#00FF00");
          })
          .on("mouseout", function(event){
            d3.select(this).attr("stroke-width", 2);
            d3.select(this).attr("stroke-opacity", 0.8);
            if(active)
              d3.select(this).attr("stroke", brushHighlight(d[keyz]));
            else
              d3.select(this).attr("stroke", deselectedColor);
          });
        
        if (active) {
          d3.select(this).raise();
          selected.push(d);
        }
      });
      svgRef.property("value", selected).dispatch("input");
    }

    function buildPCP(attributes, width, height, margin, highlight, polyline, 
                      keyz, label, x_axis, y_axis, brush){
      
      const svg = d3.select("#container").append("svg")
      .attr("width", width)
      .attr("height", height);  
      
      const path = svg.append("g")
        .attr("fill", "none")
        .attr("stroke-width", 2.0)
        .attr("stroke-opacity", 0.8)
        .selectAll("path")
        .data(data["nodes"])
        .join("path")
        .attr("stroke", d => highlight(d[keyz]))
        .attr("d", d => { return polyline(d3.cross(attributes, [d], (key, d) => { return [key, d[key]]; })); })
        .on("mouseover", function(d){
          d3.select(this).attr("stroke-width", 6);
          d3.select(this).attr("stroke-opacity", 2);
          d3.select(this).attr("stroke", "#00FF00");
          //console.log("over");
        })
        .on("mouseout", function(d){
          d3.select(this).attr("stroke-width", 2);
          d3.select(this).attr("stroke-opacity", 0.8);
          d3.select(this).attr("stroke", d => highlight(d[keyz]));
          //console.log("out");
        }); 
        
      path.append("title").text(label);

      const g = svg.append("g")
          .selectAll("g")
          .data(attributes)
          .join("g")
            .attr("transform", d => `translate(${x_axis(d)},0)`)
            .each(function(d) { d3.select(this).call(d3.axisLeft(y_axis.get(d)).tickFormat(function(d){
              return d < 0 ? "NA" : d
            })); })
            .call(d3.drag()
              .subject(function(event, d){ return {x: x_axis(d)};  })
              .on("start", function(d){
                  //console.log("drag started");
                  dragging[d] = x_axis(d);
              })
              .on("drag", function(event, d){
                dragging[d] = Math.min(width-margin.right, Math.max(margin.left, event.x));
                //console.log(position(d));
                attributes.sort(function(a, b){ return position(a)-position(b); })
                x_axis.domain(attributes);
                g.attr("transform", function(d){ return "translate(" + position(d) + ")"; });
                path.each(function(d){ 
                  d3.select(this).select("title").remove();
                  d3.select(this).append("title").text(label); 
                });
              })
              .on("end", function(event, d){
                delete dragging[d];
                d3.select(this).transition().duration(500)
                  .attr("transform", "translate(" + x_axis(d) + ")");
                path.transition().duration(300)
                    .attr("d", d => polyline(d3.cross(attributes, [d], (key, d) => [key, d[key]])));
                
                // rebuild the axis dropdowns
                d3.select("#attribute-selection-root").remove();
                setupAttributeSelectionDropdowns();
              })
            )
            .call(g => g.append("text")
              .attr("x", margin.left-35)
              .attr("y", 20)
              .attr("text-anchor", "middle")
              .attr("fill", "currentColor")
              .text(d => d))
            .call(g => g.selectAll("text")
              .clone(true).lower()
              .attr("fill", "none")
              .attr("stroke-width", 5)
              .attr("stroke-linejoin", "round")
              .attr("stroke", "white"));
        
          g.append("g")
           .each(function(d){
            d3.select(this).call(brush);
           });
        
        return svg;
    }

    function setupAttributeSelectionDropdowns(){
      const div_attr_drpdwn = d3.select(document.createElement("div"));
      div_attr_drpdwn.attr("id", "attribute-selection-root");
      attributes.forEach(axis_attr => {
        const form = d3.select(document.createElement("form"));
        form.attr("id", `axis-attribute-${axis_attr}`);
        form.attr("class", "attribute-selection-dropdown");
        const select = d3.select(document.createElement("select"));
        allAttributes.forEach(attr => {
          if(!(attributes.filter(el=>el!=axis_attr).includes(attr)) && attr !== "label"){
            select.append("option")
              .attr("value", attr)
              .text(attr);
          }
        });

        select.property("value", axis_attr); 
        select.on("change", () => {
          console.log("change...");
          attributeChangeEventHandler();
          form.property("axis-attribute-changed-to", select.property("value"));
          form.node().dispatchEvent(new Event("change-axis-attribute"));
        });
        //select.on("change")();

        form.append(() => select.node());
        div_attr_drpdwn.append(() => form.node());
      });
      d3.select("#attribute-selection-container").append(() => div_attr_drpdwn.node());
    }

    function position(d){
      let pos = dragging[d];
      return pos == null ? x_axis(d) : pos;
    }

    function build_x_axis(){
      let x_axis = d3.scalePoint(attributes, [margin.left, width - margin.right]);
      return x_axis;
    }

    function build_y_axis(){
      let y_axis = new Map(
        Array.from(
          attributes, 
          attr => { 
            const scale = d3.scaleLinear(
                            d3.extent(data["nodes"], d => d[attr]), [margin.top, height - margin.bottom]
                          );
            return [attr, scale]; }
              )
            );
      return y_axis;
    }

    function build_polyline(x_axis, y_axis){
      let polyline = d3.line()
        //.defined(([,value]) => value != undefined)
        .x(([key]) => x_axis(key))
        .y(([key, value]) => y_axis.get(key)(value));
      return polyline;
    }

    function build_label_for_polyline(){
      let alabel = function(d){
        let str = d["label"] + ' : ';
        let playerValues = [];
        attributes.forEach(attr => {
          if(d[attr] >= 0)
            playerValues.push(d[attr]);
          else
            playerValues.push("NA");
        });
        str += playerValues.join(', ');
        return str;
      }
      return alabel;
    }

    function getAttributes(){
      let attributes = [];
      data["nodes"].forEach(playerData => {
        ignoredDataAttributes = ["id"];
        for(let dataAttribute in playerData){
          //check if the data attr being looked at isnt "id"
          //and hasnt already been added to our attributes list
          if(!(ignoredDataAttributes.includes(dataAttribute)) && 
              !(attributes.includes(dataAttribute))){
            attributes.push(dataAttribute);
          }
        }
      });

      //comment this - mocking attributes list
      /*attributes = ['appearance', 'mins_played', 'ball_recovery', 'challenge_lost', 'touches',
                    'clearance_total', 'dispossessed', 'dribble_lost', 'duel_aerial_lost', 'duel_aerial_won']; */
      return attributes;
    }

    function getAttributesOfPlayer(playerData){
      return Object.keys(playerData);
    }


    function populateMissingAttributes(){
      const allAttributes = getAttributes(); //get a list of all the attributes
      data["nodes"].forEach(playerData => {
        const playerAttributes = getAttributesOfPlayer(playerData);  
        //console.log(playerAttributes);
        allAttributes.forEach(dataAttribute => {
          if(!(playerAttributes.includes(dataAttribute))){
            playerData[dataAttribute] = tickDistMap.get(dataAttribute); // app. negative value represents NA value, workaround suitable for our dataset
          }
        });
      });
    }

    function returnAttributeTickDistance(){
      
      let tickDistMap = new Map(
        Array.from(
          allAttributes, 
          attr => { 
            const scale = d3.scaleLinear(
                            d3.extent(data["nodes"], d => d[attr]), [margin.top, height - margin.bottom]
                          );
            const ticks = scale.ticks();
            const tickDistance = Number((ticks[1] - ticks[2]).toFixed(1));
            return [attr, tickDistance]; }
              )
            );

      //some manual updates required due to too little available value for attributes
      tickDistMap.set("keeper_missed", -0.1);
      tickDistMap.set("punches", -0.5);
      tickDistMap.set("red_card", -0.1);
      tickDistMap.set("second_yellow", -0.1);
      tickDistMap.set("penalty_scored", -0.1);
      tickDistMap.set("duel_aerial_won", -5);
      tickDistMap.set("foul_committed", -2);
      tickDistMap.set("sub_off", -1);
      tickDistMap.set("sub_on", -1);
      tickDistMap.set("assist", -0.5);
      tickDistMap.set("goal_head", -0.2);
      //console.log(tickDistMap);
      return tickDistMap;
    }

    function setupColorEncodingDropdown(){
      const form = d3.select(document.createElement("form"));
      form.attr("id", "color-encoding");
      form.attr("class", "color-encoding-dropdown");
      const select = d3.select(document.createElement("select"));
      attributes.forEach(attr => {
        select.append("option")
          .attr("value", attr)
          .text(attr);
      });

      select.property("value", keyz);
      select.on("change", () => {
        console.log("encoding change...");
        colorEncodingChangeEventHandler();
        form.property("attribute-changed-to", select.property("value"));
        //form.dispatch("change-attribute");
        form.node().dispatchEvent(new Event("change-attribute"));
      });
      //select.on("change")();

      form.append(() => select.node());
      form.append("i")
        .style("font-size", "smaller")
        .style("margin-left", "15px")
        .text("Select attribute as basis of color encoding");

      //d3.select("#container").append(() => form.node());
      d3.select("#color-encoding-container").append(() => form.node());
    }

    function setupDescPopup(){
      const popup = d3.select("#desc-popup");

      popup.append("button")
           .text("Usage")
           .on("mouseover", showPopup)
           .on("mouseout", hidePopup);

      function showPopup() {
        const text = "Instructions: <br/> 1. Select a different attribute from top left dropdown as the basis of color encoding the polylines"+
                      "<br/> 2. Drag and draw a brushable rectangle on any axis. Click anywhere else on same axis to deactivate brush" +
                      "<br/> 3. Hover on any tick of an axis (a four sided arrow shows up) then drag and pull to reorder axis" +
                      "<br/> 4. Select different attributes from the dropdowns below the axes";
        const p = popup.append("div")
                        .attr("class", "popup-desc")
                        .html(text)
                        .style("opacity", 0);
        p.transition()
             .duration(500)
             .style("opacity", 1);
      }

      function hidePopup() {
        popup.select(".popup-desc").remove();
      }
    }
    
    });
  
};
