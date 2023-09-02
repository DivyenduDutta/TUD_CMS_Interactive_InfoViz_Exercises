var d3; // Minor workaround to avoid error messages in editors

// Waiting until document has loaded
window.onload = () => {
  const height = 470;
  const margin = { left: 60, top: 30, right: 50, bottom: 120 };
  const state2 = 1110;
  const state3 = 750;
  const state4 = 624;
  const state5 = 450;

  const resizeChart = () => {
    const containerWidth = parseInt(d3.select('div#chart-container').style('width'), 10);
    const width = containerWidth - margin.left - margin.right;
    const barWidth = width / 6;

    // Load the data from energy.csv
    d3.csv('data/energy.csv').then(data => {
      const filteredData = [];
      data.forEach(row => {
        const energySource = row['Energy sources'];
        if (
          energySource === 'Wind power' ||
          energySource === 'Water power' ||
          energySource === 'Biomass energy' ||
          energySource === 'Photovoltaic energy' ||
          energySource === 'Household waste' ||
          energySource === 'Geothermal'
        ) {
          filteredData.push(row);
        }
      });

      const energySources = filteredData.map(d => d['Energy sources']);
      let energyValues = filteredData.map(d => parseFloat(d['2022 (Billion kWh)']));

      d3.select('div#chart-container').selectAll('svg').remove();
      
      const svg = d3
        .select('div#chart-container')
        .append('svg')
        .attr('width', containerWidth)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
      
      svg.append('text')
        .attr('x', containerWidth/2)
        .attr('y', 0)
        .text(getDisplayTextForResize(containerWidth));

      if(containerWidth <= state5){
          const barHeight = height / 6;
          const x = d3.scaleLinear()
            .domain([0, d3.max(energyValues)])
            .range([0, width]);

          const xAxis = d3.axisBottom(x).ticks(5);
          
          const y = d3.scaleBand()
            .domain(energySources)
            .range([0, height])
            .padding(0.1);

          const yAxis = d3.axisLeft(y);

          const bar = svg
            .selectAll('g')
            .data(energyValues)
            .enter()
            .append('g')
            .attr('transform', (_, i) => `translate(0, ${i * barHeight + getBarwidthForResize(containerWidth)})`);

          svg
            .append('g')
            .attr('class', 'xaxis')
            .attr('transform', `translate(0, ${height})`)
            .style('font-size', getFontSizeOfBarTextForResize(containerWidth))
            .call(xAxis);

          svg
            .append('g')
            .attr('class', 'yaxis')
            .call(yAxis);

          d3.select('g.yaxis').selectAll('text')
            .style('text-anchor', 'end')
            .attr('transform', 'rotate(-60)')
            .attr('dx', '-.1em')
            .attr('dy', '-.05em');

          bar
            .append('rect')
            .attr('class', 'bar')
            .attr('x', 0)
            .attr('width', d => x(d))
            .attr('height', barHeight - 15)
            .attr('fill', getBarColorForResize(containerWidth));

          bar
            .append('text')
            .attr('class', 'bartext')
            .attr('y', (barWidth/2) + 15)
            .attr('x', d => x(d) + 20)
            .text(d => d.toFixed(1))
            .style('font-size', getFontSizeOfBarTextForResize(containerWidth));
      }
      else{
          const x = d3.scaleBand()
            .domain(energySources)
            .range([0, width])
            .padding(0.1);

          const xAxis = d3.axisBottom(x);

          const y = d3.scaleLinear()
            .domain([0, d3.max(energyValues)])
            .range([height, 0]);

          const yAxis = d3.axisLeft(y).ticks(5);

          const bar = svg
            .selectAll('g')
            .data(energyValues)
            .enter()
            .append('g')
            .attr('transform', (_, i) => `translate(${i * barWidth + getBarwidthForResize(containerWidth)}, 0)`);

          svg
            .append('g')
            .attr('class', 'xaxis')
            .attr('transform', `translate(0, ${height})`)
            .style('font-size', getFontSizeOfBarTextForResize(containerWidth))
            .call(xAxis);

          svg
            .append('g')
            .attr('class', 'y axis')
            .call(yAxis);

          if (containerWidth <= state4) { //state 4
            d3.select('g.xaxis').selectAll('text')
              .style('text-anchor', 'end')
              .attr('transform', 'rotate(-90)')
              .attr('dx', '-.8em')
              .attr('dy', '.15em');
          }
          else if (containerWidth <= state2) { //state 2
            d3.select('g.xaxis').selectAll('text')
              .style('text-anchor', 'end')
              .attr('transform', 'rotate(-25)')
              .attr('dx', '-.8em')
              .attr('dy', '.15em');
          } else {
            svg.select('g.xaxis').call(xAxis);
          }

          bar
            .append('rect')
            .attr('class', 'bar')
            .attr('width', barWidth - 15)
            .attr('y', d => y(d))
            .attr('height', d => height - y(d))
            .attr('fill', getBarColorForResize(containerWidth));

          bar
            .append('text')
            .attr('class', 'bartext')
            .attr('x', (barWidth/2)-25)
            .attr('y', d => y(d) - 2)
            .text(d => d.toFixed(1))
            .style('font-size', getFontSizeOfBarTextForResize(containerWidth));
      }
    });
  };

  function getBarwidthForResize(containerWidth){
    if(containerWidth <= state3){
      return 15;
    }
    else{
      return 35;
    }
  }
  
  function getFontSizeOfBarTextForResize(containerWidth){
    if(containerWidth <= state4){
      return '12px';
    }
    else if(containerWidth <= state3){
      return '15px';
    }
    else{
      return '20px';
    }

  }
  
  function getDisplayTextForResize(containerWidth){
    if(containerWidth <= state5){
      return 'State 5';
    }
    else if(containerWidth <= state4){
      return 'State 4';
    }
    else if(containerWidth <= state3){
      return 'State 3';
    }
    else if(containerWidth <= state2){
      return 'State 2';
    }
    else{
      return 'Default State';
    }

  }
  
  function getBarColorForResize(containerWidth){
    if(containerWidth <= state5){
      return '#829b7c';
    }
    else if(containerWidth <= state4){
      return '#bf9a8e';
    }
    else if(containerWidth <= state3){
      return '#dcc278';
    }
    else if(containerWidth <= state2){
      return '#c7bea0';
    }
    else{
      return '#86b9d4';
    }

  }

  resizeChart();
  window.addEventListener('resize', resizeChart);
};
