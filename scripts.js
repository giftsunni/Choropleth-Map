const width = 960, height = 600, margin = 20;

// Set up the SVG canvas
const svg = d3.select('#choropleth')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

// Load the data for counties and education levels
Promise.all([
    d3.json('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json'), // Counties map
    d3.json('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json') // Education data
]).then(([us, educationData]) => {

    const education = educationData.reduce((acc, d) => {
        acc[d.fips] = d;
        return acc;
    }, {});

    // Define a color scale with at least 4 different colors
    const colorScale = d3.scaleQuantize()
        .domain([d3.min(educationData, d => d.bachelorsOrHigher), d3.max(educationData, d => d.bachelorsOrHigher)])
        .range(d3.schemeBlues[5]);

    // Create a path generator
    const path = d3.geoPath();

    // Draw the counties with class="county"
    svg.append('g')
        .selectAll('path')
        .data(topojson.feature(us, us.objects.counties).features)
        .enter().append('path')
        .attr('class', 'county')
        .attr('d', path)
        .attr('fill', d => {
            const edu = education[d.id];
            return edu ? colorScale(edu.bachelorsOrHigher) : '#ccc';
        })
        .attr('data-fips', d => d.id)
        .attr('data-education', d => education[d.id] ? education[d.id].bachelorsOrHigher : 0)
        .on('mouseover', (event, d) => {
            const edu = education[d.id];
            d3.select('#tooltip')
                .style('opacity', 1)
                .html(`FIPS: ${d.id}<br>Education: ${edu ? edu.bachelorsOrHigher : 'N/A'}%`)
                .attr('data-education', edu ? edu.bachelorsOrHigher : 0)
                .style('left', `${event.pageX + 10}px`)
                .style('top', `${event.pageY - 28}px`);
        })
        .on('mouseout', () => d3.select('#tooltip').style('opacity', 0));

    // Create a legend with at least 4 different colors
    const legendColors = d3.schemeBlues[5];
    const legendScale = d3.scaleLinear()
        .domain(colorScale.domain())
        .range([0, 300]);

    const legend = d3.select('#legend')
        .attr('id', 'legend');

    legend.selectAll('.legend-item')
        .data(legendColors)
        .enter().append('div')
        .attr('class', 'legend-item')
        .style('background-color', d => d)
        .style('width', '50px')
        .style('height', '20px');

}).catch(error => console.error(error));
