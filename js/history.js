const undefinded_color = "rgb(126,126,126)";

class MapPlot {

	makeColorbar(svg, color_scale, top_left, colorbar_size, scaleClass=d3.scaleLog) {

		const value_to_svg = scaleClass()
			.domain(color_scale.domain())
			.range([colorbar_size[1], 0]);

		const range01_to_color = d3.scaleLinear()
			.domain([0, 1])
			.range(color_scale.range())
			.interpolate(color_scale.interpolate());

		// Axis numbers
		const colorbar_axis = d3.axisLeft(value_to_svg)
			.tickFormat(d3.format(".0f"))

		const colorbar_g = this.svg.append("g")
			.attr("id", "colorbar")
			.attr("transform", "translate(" + top_left[0] + ', ' + top_left[1] + ")")
            .call(colorbar_axis);
            
        const undefined_g = this.svg.append("g")
			.attr("id", "undefinded_color")
            .attr("transform", "translate(" + top_left[0] + ', ' + 20 + ")");
            
        const undef_text = this.svg.append("g").attr("width", 800).attr("height", 200)

		// Create the gradient
		function range01(steps) {
			return Array.from(Array(steps), (elem, index) => index / (steps-1));
		}

		const svg_defs = this.svg.append("defs");

		const gradient = svg_defs.append('linearGradient')
			.attr('id', 'colorbar-gradient')
			.attr('x1', '0%') // bottom
			.attr('y1', '100%')
			.attr('x2', '0%') // to top
			.attr('y2', '0%')
			.attr('spreadMethod', 'pad');

		gradient.selectAll('stop')
			.data(range01(10))
			.enter()
			.append('stop')
				.attr('offset', d => Math.round(100*d) + '%')
				.attr('stop-color', d => range01_to_color(d))
				.attr('stop-opacity', 1);

		// create the colorful rect
		colorbar_g.append('rect')
			.attr('id', 'colorbar-area')
			.attr('width', colorbar_size[0])
			.attr('height', colorbar_size[1])
			.style('fill', 'url(#colorbar-gradient)')
			.style('stroke', 'black')
            .style('stroke-width', '1px')
        
        undefined_g.append('rect')
			.attr('id', 'undefined-area')
			.attr('width', 20)
			.attr('height', 20)
			.style('fill', undefinded_color)
			.style('stroke', 'black')
            .style('stroke-width', '1px')

        undef_text.append('text')
            .attr('x', 100)
            .attr('y', 35)
            .attr('stroke', 'black')
            .style("font-size", 16)
            .text("No information available")
	}

	constructor(svg_element_id) {
		this.svg = d3.select('#' + svg_element_id);

		// may be useful for calculating scales
		const svg_viewbox = this.svg.node().viewBox.animVal;
		this.svg_width = svg_viewbox.width;
		this.svg_height = svg_viewbox.height;


		// D3 Projection
		// similar to scales
		const projection = d3.geoNaturalEarth1()
			.rotate([0, 0])
			.center([-6.48, 54.4]) // WorldSpace: Latitude and longitude of center of Northern Ireland
			.scale(13000)
			.translate([this.svg_width / 2, this.svg_height / 2]) // SVG space
			.precision(.1);

		// path generator to convert JSON to SVG paths
		const path_generator = d3.geoPath()
			.projection(projection);

		//colormap for population density
		const color_scale = d3.scaleLog()
			.range(["hsl(88,80%,80%)", "hsl(228,60%,30%)"])
			.interpolate(d3.interpolateHcl);

		const counts_promise = d3.csv("https://raw.githubusercontent.com/com-480-data-visualization/datavis-project-2022-alendro_and_the_aleandros/history_pubs/choropleth/pub_counts/ni_count_history.csv").then((data) => {
			let lad_to_counts = {};
			data.forEach((row) => {
				lad_to_counts[row.lad] = parseFloat(row.Y_2010);
            });
            console.log(lad_to_counts);
			return lad_to_counts;
		});

		const map_promise = d3.json("https://raw.githubusercontent.com/com-480-data-visualization/datavis-project-2022-alendro_and_the_aleandros/history_pubs/choropleth/topo/ni_topo_lgd.json").then((topojson_raw) => {
            console.log(topojson_raw);
            const lgd_paths = topojson.feature(topojson_raw, topojson_raw.objects.lgd);
            console.log(lgd_paths);
            return lgd_paths.features;
		});


		Promise.all([counts_promise, map_promise]).then((results) => {
			let lad_to_counts = results[0];
			let map_data = results[1];

			map_data.forEach(lad => {
				lad.properties.counts = lad_to_counts[lad.properties.LGDNAME];
			});

            console.log(map_data);
            const counts = Object.values(lad_to_counts);
            console.log(counts);

			// color_scale.domain([d3.quantile(densities, .01), d3.quantile(densities, .99)]);
			color_scale.domain([d3.min(counts), d3.max(counts)]);
            console.log(color_scale(0));
			// Order of creating groups decides what is on top
			this.map_container = this.svg.append('g');
			this.label_container = this.svg.append('g'); // <- is on top

            let mouseOver = function(d) {
                d3.selectAll(".district")
                  .transition()
                  .duration(200)
                  .style("opacity", .5)
                  .style("stroke-width", "0px")
                d3.select(this)
                  .transition()
                  .duration(200)
                  .style("opacity", 1)
                  .style("stroke", "rgb(25, 25, 25)")
                  .style("stroke-width", "1px");
              }
            
            let mouseLeave = function(d) {
                d3.selectAll(".district")
                  .transition()
                  .duration(200)
                  .style("opacity", 1)
                d3.select(this)
                  .transition()
                  .duration(200)
                  .style("stroke", "rgb(25, 25, 25)")
                  .style("stroke-width", "0px")
              }

			//color the map according to the density of each canton
			this.map_container.selectAll(".district")
				.data(map_data)
				.enter()
				.append("path")
				.classed("district", true)
				.attr("d", path_generator)
				.style("fill", (d) => {
                    if(typeof(d.properties.counts) == 'undefined') {
                        return undefinded_color;
                    }
                    return color_scale(d.properties.counts);
                })
                .style("stroke", "transparent")
                .style("opacity", 1)
                .on("mouseover", mouseOver )
                .on("mouseleave", mouseLeave );

			this.label_container.selectAll(".district-label")
				.data(map_data)
				.enter().append("text")
				.classed("district-label", true)
				.attr("transform", (d) => "translate(" + path_generator.centroid(d) + ")")
				//.translate((d) => path_generator.centroid(d))
				.attr("dy", ".35em")
				.text((d) => d.properties.LGDNAME);

			const r = 3;

			this.makeColorbar(this.svg, color_scale, [50, 70], [20, this.svg_height - 3*30]);
		});
	}
}

function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		// `DOMContentLoaded` already fired
		action();
	}
}

whenDocumentLoaded(() => {
	plot_object = new MapPlot('map-plot');
	// plot object is global, you can inspect it in the dev-console
});
