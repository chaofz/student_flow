  var margin = {
      top: 310,
      right: 10,
      bottom: 10,
      left: 245
    },
    width = 850,
    height = 850,
    rw = 40,
    rh = 40;

  var color = d3.scale.category20();

  var colorMap = d3.scale.linear()
    .domain([0, 0.5])
    .range(["white", d3.hsl(235, 1, 0.5)]);

  var colorMap1 = d3.scale.linear()
    .domain([0, 0.91])
    .range(["white", d3.hsl(35, 1, 0.6)]);

  var svg = d3.select("body").append("svg")
    .attr("class", "squareSvg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    // .style("margin-left", margin.left + "px")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var sideWidth = 450,
    sideHeight = 200,
    padding = {
      left: 54,
      right: 30,
      top: 20,
      bottom: 20
    };

  d3.select("#histo").append("svg")
    .attr("class", "sideview")
    .attr("id", "sideview0")
    .attr("width", sideWidth)
    .attr("height", sideHeight)
    .append("g");

  d3.select("#histo").append("svg")
    .attr("class", "sideview")
    .attr("id", "sideview1")
    .attr("width", sideWidth)
    .attr("height", sideHeight)
    .append("g");

  d3.csv("data/flow.csv", function(error1, data) {
    if (error1) throw error;
    var majors = Object.keys(data[0]);
    matrix = [];
    data.forEach(function(d) {
      var values = [];
      for (var k in d) {
        var str = d[k].replace(/'/g, '"');
        values.push(JSON.parse(str));
      }
      matrix.push(values);
    });

    var grp = svg.selectAll('g')
      .data(matrix)
      .enter()
      .append('g')
      .attr('transform', function(d, i) {
        return 'translate(0, ' + 45 * i + ')';
      });

    var cell = grp.selectAll('g')
      .data(function(d) {
        return d;
      })
      .enter()
      .append('g')
      .on("mouseover", rectMouseover);

    function rectMouseover(data) {
      if (document.getElementsByName("viewOption")[0].checked)
        return;
      d3.selectAll(".selected")
        .attr("class", "unselected")
        .style("fill", function(d, i) {
          if (i === 0) {
            if (d._2Total < 0.6)
              return colorMap(d._1Total);
            else
              return colorMap1(d._1Total);
          } else {
            if (d._2Total < 0.6)
              return colorMap(d._2Total);
            else
              return colorMap1(d._2Total);
          }
        });
      d3.select(this).selectAll("rect")
        .attr("class", "selected")
        .style("fill", function(data, i) {
          if (i === 0)
            return "yellow";
          else
            return "blue";
        });

      var genderDataset = [data._1Total, data._2Total, data._1Male, data._2Male, data._1Female, data._2Female];
      var gradeDataset = [data._1Total, data._2Total, data._1Good, data._2Good, data._1Moderate, data._2Moderate, data._1Poor, data._2Poor];

      yScale = d3.scale.linear()
        .domain([0, 1.0])
        .range([sideHeight - padding.top - padding.bottom, 0]);
      yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .tickFormat(function(d, i) {
          return d3.format('.2%')(d);
        })
        .ticks(6);
      yRadio = d3.select('input[name="yAxisType"]:checked').node().value;
      if (genderDataset[0] > 0.5 || genderDataset[1] > 0.5) {
        if (yRadio === "fixed")
          yScale.domain([0, 1.0]);
        else
          yScale.domain([0, d3.max(genderDataset)]);
        rectColor = "#900";
      } else {
        if (yRadio === "fixed")
          yScale.domain([0, 0.45]);
        else
          yScale.domain([0, d3.max(genderDataset)]);
        rectColor = "#090";
      }

      if (d3.select(".MyRect").empty()) {
        generateSideView(genderDataset, 0, ["Average", "Male", "Female"]);
        generateSideView(gradeDataset, 1, ["Average", "Good", "Moderate", "Poor"]);
      } else {
        updateSideView(genderDataset, 0, ["Average", "Male", "Female"]);
        updateSideView(gradeDataset, 1, ["Average", "Good", "Moderate", "Poor"]);
      }
    }

    var rects1 = cell.append('rect')
      .attr('x', function(d, i) {
        return 45 * i;
      })
      .attr('width', rw)
      .attr('height', rh / 2)
      .style("fill", function(d, i) {
        if (d._2Total < 0.6)
          return colorMap(d._1Total);
        else
          return colorMap1(d._1Total);
      });

    var rects2 = cell.append('rect')
      .attr('x', function(d, i) {
        return 45 * i;
      })
      .attr('transform', function(d, i) {
        return 'translate(0, ' + 20 + ')';
      })
      .attr('width', rw)
      .attr('height', rh / 2)
      .style("fill", function(d, i) {
        if (d._2Total < 0.6)
          return colorMap(d._2Total);
        else
          return colorMap1(d._2Total);
      });

    cell.append("text")
      .attr("class", "squareRates")
      .attr("transform", function(d, i) {
        return "translate(" + (45 * i + 21) + "," + 14 + ")";
      })
      .attr("text-anchor", "middle")
      .attr("font-size", 10)
      .style('fill', '#bbb')
      .text(function(d) {
        return d3.format(".2%")(d._1Total);
      });

    cell.append("text")
      .attr("class", "squareRates")
      .attr("transform", function(d, i) {
        return "translate(" + (45 * i + 21) + "," + 34 + ")";
      })
      .attr("text-anchor", "middle")
      .attr("font-size", 10)
      .style('fill', '#bbb')
      .text(function(d) {
        return d3.format(".2%")(d._2Total);
      });

    var column = svg.selectAll(".column")
      .data(majors)
      .enter()
      .append("g")
      .attr("class", "column")
      .attr("font-size", 13)
      .attr("transform", function(d, i) {
        return "translate(" + (45 * i + 21) + "," + -10 + ")rotate(-90)";
      });

    column.append("text")
      .attr("transform", function(d, i) {
        return "translate(" + 3 + "," + 2 + ")";
      })
      .attr("text-anchor", "start")
      .text(function(d, i) {
        return d;
      });

    var row = svg.selectAll(".row")
      .data(majors)
      .enter()
      .append("g")
      .attr("class", "row")
      .attr("font-size", 13)
      .attr("transform", function(d, i) {
        return "translate(" + -7 + "," + (45 * i + 22) + ")";
      });

    row.append("text")
      .attr("transform", function(d, i) {
        return "translate(" + -7 + "," + 2 + ")";
      })

    .attr("text-anchor", "end")
      .text(function(d, i) {
        return d;
      });
  });

  function updateSideView(dataset, index, xAxisLabel) {
    var sideView = d3.select("#sideview" + index);
    var rects = sideView.selectAll(".MyRect")
      .data(dataset)
      .transition()
      .duration(350)
      .attr("y", function(d) {
        return yScale(d);
      })
      .attr("height", function(d) {
        return sideHeight - padding.top - padding.bottom - yScale(d);
      });

    var texts = sideView.selectAll(".MyText")
      .data(dataset)
      .transition()
      .duration(350)
      .attr("y", function(d) {
        return yScale(d);
      })
      .text(function(d) {
        return d3.format('.2%')(d);
      });

    yAxis.scale(yScale);
    sideView.select("#yaxis")
      .call(yAxis);
  }

  var yScale;
  var yAxis;
  var rectColor;
  var yRadio;

  function generateSideView(dataset, index, xAxisLabel) {
    var sideView = d3.select("#sideview" + index);
    var rectPadding = 10;
    var xScale = d3.scale.ordinal()
      .domain(d3.range(dataset.length))
      .rangeRoundBands([0, sideWidth - padding.left - padding.right]);
    var xAxisScale = d3.scale.ordinal()
      .domain(d3.range(dataset.length / 2))
      .rangeRoundBands([0, sideWidth - padding.left - padding.right]);

    var xAxis = d3.svg.axis()
      .scale(xAxisScale)
      .tickFormat(function(d, i) {
        return xAxisLabel[i];
      })
      .orient("bottom");

    var rects = sideView.selectAll(".MyRect")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("class", "MyRect")
      .attr("transform", "translate(" + padding.left + "," + padding.top + ")")
      .attr("fill", function(d, i) {
        if (i % 2 === 0)
          return "yellow";
        else
          return "blue";
      })
      .transition()
      .attr("x", function(d, i) {
        if (i % 2 === 0)
          return xScale(i) + rectPadding / 2;
        else
          return xScale(i) - rectPadding / 2;
      })
      .attr("y", function(d) {
        return yScale(d);
      })
      .attr("width", xScale.rangeBand() - rectPadding)
      .attr("height", function(d) {
        return sideHeight - padding.top - padding.bottom - yScale(d);
      });

    var texts = sideView.selectAll(".MyText")
      .data(dataset)
      .enter()
      .append("text")
      .attr("class", "MyText")
      .attr("transform", "translate(" + padding.left + "," + padding.top + ")")
      .attr("x", function(d, i) {
        if (i % 2 === 0)
          return xScale(i) + rectPadding / 2;
        else
          return xScale(i) - rectPadding / 2;
      })
      .attr("y", function(d) {
        return yScale(d);
      })
      .attr("dx", function() {
        return (xScale.rangeBand() - rectPadding) / 2;
      })
      .attr("dy", function(d) {
        return -5;
      })
      .attr("font-size", 12)
      .text(function(d) {
        return d3.format('.2%')(d);
      });

    sideView.append("g")
      .attr("class", "axis")
      .attr("id", "xaxis")
      .attr("transform", "translate(" + padding.left + "," + (sideHeight - padding.bottom) + ")")
      .call(xAxis);

    sideView.append("g")
      .attr("class", "axis")
      .attr("id", "yaxis")
      .attr("transform", "translate(" + padding.left + "," + padding.top + ")")
      .call(yAxis);
  }

  function showSankey() {
    d3.selectAll(".selected")
      .attr("class", "unselected")
      .style("fill", function(d, i) {
        if (i === 0) {
          if (d._2Total < 0.6)
            return colorMap(d._1Total);
          else
            return colorMap1(d._1Total);
        } else {
          if (d._2Total < 0.6)
            return colorMap(d._2Total);
          else
            return colorMap1(d._2Total);
        }
      });
    document.getElementById('sankey').style.visibility = "hidden";
    document.getElementById('histo').style.visibility = "visible";
  }

  function showHisto() {
    d3.select("#hovered")
      .attr("class", "unhovered")
      .style("fill", "white");
    document.getElementById('sankey').style.visibility = "hidden";
    document.getElementById('histo').style.visibility = "visible";
  }

  var units = "Widgets";

  var margin = {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10
    },
    width = 510 - margin.left - margin.right,
    height = 830 - margin.top - margin.bottom;

  var formatNumber = d3.format(",.0f"), // zero decimal places
    format = function(d) {
      return formatNumber(d) + " " + units;
    };

  // append the svg canvas to the page
  var sankeyGraph = d3.select("#sankey").append("svg")
    .attr("width", width + margin.left + margin.right + 170)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  // Set the sankey diagram properties
  var sankey = d3.sankey()
    .nodeWidth(27)
    .nodePadding(7)
    .size([width, height]);

  var path = sankey.link();

  // load the data (using the timelyportfolio csv method)
  d3.csv("data/sankey.csv", function(error, data) {

    //set up graph in same style as original example but empty
    graph = {
      "nodes": [],
      "links": []
    };

    data.forEach(function(d) {
      graph.nodes.push({
        "name": d.source
      });
      graph.nodes.push({
        "name": d.target
      });
      graph.links.push({
        "source": d.source,
        "target": d.target,
        "value": +d.value
      });
    });

    // return only the distinct / unique nodes
    graph.nodes = d3.keys(d3.nest()
      .key(function(d) {
        return d.name;
      })
      .map(graph.nodes));

    // console.log(graph.nodes);

    // loop through each link replacing the text with its index from node
    graph.links.forEach(function(d, i) {
      graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
      graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
    });

    //now loop through each nodes to make nodes an array of objects
    // rather than an array of strings
    graph.nodes.forEach(function(d, i) {
      graph.nodes[i] = {
        "name": d
      };
    });

    sankey
      .nodes(graph.nodes)
      .links(graph.links)
      .layout(32);

    // add in the links
    var link = sankeyGraph.append("g").selectAll(".link")
      .data(graph.links)
      .enter().append("path")
      .attr("class", "link")
      .attr("d", path)
      .attr("class", function(d) {
        if (d.source.name.endsWith("0"))
          return "link link0 source_" + nameHash(d.source.name) + " target_" + nameHash(d.target.name) + " unclickedLink";
        else
          return "link link1 source_" + nameHash(d.source.name) + " target_" + nameHash(d.target.name) + " unclickedLink";
      })
      .style("stroke-width", function(d) {
        return Math.max(1, d.dy);
      })
      .sort(function(a, b) {
        return b.dy - a.dy;
      });

    // add the link titles
    link.append("title")
      .text(function(d) {
        return d.source.name + " → " +
          d.target.name + "\n" + format(d.value);
      });

    // add in the nodes
    var node = sankeyGraph.append("g").selectAll(".node")
      .data(graph.nodes)
      .enter().append("g")
      .attr("class", "node unclicked")
      .attr("id", "unhovered")
      .attr("transform", function(d, i) {
        return "translate(" + d.x + "," + d.y + ")";
      })
      .call(d3.behavior.drag()
        .origin(function(d) {
          return d;
        })
        .on("dragstart", function() {
          this.parentNode.appendChild(this);
        })
        .on("drag", dragmove))
      .on("mouseover", function(d) {
        var name = nameHash(d.name);
        if (d.name.endsWith("0")) {
          // if (sankeyGraph.selectAll(".link1").filter(".clickedLink")[0].length == 0) {
          d3.select("#hovered")
            .attr("id", "unhovered");
          d3.select(this)
            .attr("id", "hovered");
          sankeyGraph.selectAll(".unclickedLink")
            .style("stroke-opacity", 0);
          sankeyGraph.selectAll(".clickedLink")
            .style("stroke-opacity", 0.8);
          sankeyGraph.selectAll(".source_" + name.substring(0, name.length - 1) + "0")
            .style("stroke-opacity", 0.8)
            .style("stroke", function(d) {
              return d3.rgb(color(d.target.name.substring(0, d.target.name.length - 1)));
            });
          sankeyGraph.selectAll(".source_" + name.substring(0, name.length - 1) + "1")
            .style("stroke-opacity", 0.8)
            .style("stroke", function(d) {
              return d3.rgb(color(d.target.name.substring(0, d.target.name.length - 1)));
            });
        } else if (d.name.endsWith("1")) {
          if (sankeyGraph.selectAll(".link0").filter(".clickedLink")[0].length > 0) {

            sankeyGraph.selectAll(".clickedLink")
              .style("stroke-opacity", 0)
              .filter(".target_" + name)
              .style("stroke-opacity", 0.8)
              .style("stroke", function(d) {
                return d3.rgb(color(d.target.name.substring(0, d.target.name.length - 1)));
              });
          } else if (sankeyGraph.selectAll(".link1").filter(".clickedLink")[0].length > 0) {

            sankeyGraph.selectAll(".clickedLink")
              .style("stroke-opacity", 0)
              .filter(".source_" + name + ",.source_" + name.substring(0, name.length - 1) + "1")
              .style("stroke-opacity", 0.8)
              .style("stroke", function(d) {
                return d3.rgb(color(d.target.name.substring(0, d.target.name.length - 1)));
              });
          } else {
            sankeyGraph.selectAll(".link0, .link1")
              .style("stroke-opacity", 0);
            sankeyGraph.selectAll(".source_" + name)
              .style("stroke-opacity", 0.8)
              .style("stroke", function(d) {
                return colorConvert(d);
              })
            sankeyGraph.selectAll(".target_" + name)
              .style("stroke-opacity", 0.8)
              .style("stroke", function(d) {
                return colorConvert(d);
              })
          }
        } else {
          if (sankeyGraph.selectAll(".link1").filter(".clickedLink")[0].length > 0) {
            sankeyGraph.selectAll(".clickedLink")
              .style("stroke-opacity", 0)
              .filter(".target_" + name + ",.target_" + name.substring(0, name.length - 1) + "1")
              .style("stroke-opacity", 0.8)
              .style("stroke", function(d) {
                return d3.rgb(color(d.target.name.substring(0, d.target.name.length - 1)));
              });
          } else {
            d3.select("#hovered")
              .attr("id", "unhovered");
            d3.select(this)
              .attr("id", "hovered");
            sankeyGraph.selectAll(".unclickedLink")
              .style("stroke-opacity", 0);
            sankeyGraph.selectAll(".clickedLink")
              .style("stroke-opacity", 0.8);
            sankeyGraph.selectAll(".target_" + name.substring(0, name.length - 1) + "1")
              .style("stroke-opacity", 0.8)
              .style("stroke", function(d) {
                return d3.rgb(color(d.target.name.substring(0, d.target.name.length - 1)));
              });
            sankeyGraph.selectAll(".target_" + name.substring(0, name.length - 1) + "2")
              .style("stroke-opacity", 0.8)
              .style("stroke", function(d) {
                return d3.rgb(color(d.target.name.substring(0, d.target.name.length - 1)));
              });
          }
        }
      })
      .on("mouseout", function(d) {
        sankeyGraph.selectAll(".unclickedLink")
          .style("stroke-opacity", 0);
      })
      .on("dblclick", function(d) {
        var name = nameHash(d.name);
        var self = d3.select(this);
        if (d.name.endsWith("0")) {
          if (self.attr('class') == "node unclicked") {
            self.attr("class", "node clicked")
              .select("rect")
              .style("fill", function(d) {
                return d3.rgb(d.color).darker(1);
              });
            sankeyGraph.selectAll(".source_" + name.substring(0, name.length - 1) + "0")
              // .attr("class", "link source_" + name.substring(0, name.length - 1) + "0 clickedLink")
              .classed("clickedLink", true)
              .classed("unclickedLink", false)
              .style("stroke-opacity", 0.8)
              .style("stroke", function(d) {
                return d3.rgb(color(d.target.name.substring(0, d.target.name.length - 1)));
              });
            sankeyGraph.selectAll(".source_" + name.substring(0, name.length - 1) + "1")
              // .attr("class", "link source_" + name.substring(0, name.length - 1) + "1 clickedLink")
              .classed("clickedLink", true)
              .classed("unclickedLink", false)
              .style("stroke-opacity", 0.8)
              .style("stroke", function(d) {
                return d3.rgb(color(d.target.name.substring(0, d.target.name.length - 1)));
              });
          } else {
            self.attr("class", "node unclicked")
              .select("rect")
              .style("fill", function(d) {
                return d3.rgb(d.color);
              });
            sankeyGraph.selectAll(".source_" + name.substring(0, name.length - 1) + "0")
              // .attr("class", "link source_" + name.substring(0, name.length - 1) + "0 unclickedLink")
              .classed("unclickedLink", true)
              .classed("clickedLink", false)
              .style("stroke-opacity", 0);
            sankeyGraph.selectAll(".source_" + name.substring(0, name.length - 1) + "1")
              // .attr("class", "link source_" + name.substring(0, name.length - 1) + "1 unclickedLink")
              .classed("unclickedLink", true)
              .classed("clickedLink", false)
              .style("stroke-opacity", 0);
          }
        }
      });

    // add the rectangles for the nodes
    node.append("rect")
      .attr("height", function(d) {
        return d.dy;
      })
      .attr("width", sankey.nodeWidth())
      .style("fill", function(d) {
        d.color = color(d.name.substring(0, d.name.length - 1));
        return d3.rgb(d.color);
      })
      .style("stroke", function(d) {
        return d3.rgb(d.color).darker(1);
      })
      .append("title")
      .text(function(d) {
        return d.name + "\n" + format(d.value);
      });


    // add in the title for the nodes
    node.append("text")
      .attr("x", +35)
      .attr("y", function(d) {
        return d.dy / 2;
      })
      .attr("dy", ".35em")
      .attr("text-anchor", "start")
      .attr("transform", null)
      .text(function(d) {
        return d.name.substring(0, d.name.length - 1);
      })
      .filter(function(d) {
        return d.x < width / 2;
      })
      .attr("x", 6 + sankey.nodeWidth())
      .attr("text-anchor", "start");

    // the function for moving the nodes
    function dragmove(d) {
      d3.select(this).attr("transform",
        "translate(" + d.x + "," + (
          d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))
        ) + ")");
      sankey.relayout();
      link.attr("d", path);
    }
  });

  function nameHash(name) {
    if (name.startsWith("Eng. Tech. & Drafting"))
      return "EngT" + name.charAt(name.length - 1);
    if (name.startsWith("Health Sci. & Techno."))
      return "HeaS" + name.charAt(name.length - 1);
    if (name.startsWith("Health Admin. & Assisting"))
      return "HeaA" + name.charAt(name.length - 1);
    if (name.startsWith("Commun, Fam., & Personal Svcs"))
      return "ComF" + name.charAt(name.length - 1);
    return name.substring(0, 4) + name.charAt(name.length - 1);
  }

  function colorConvert(d) {
    return d3.rgb(color(d.target.name.substring(0, d.target.name.length - 1)));
  }
