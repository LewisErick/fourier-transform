var w = 800;
var h = 500;


// variables and setting up the svg element
var margin = {top: 20, right: 20, bottom: 100, left: 60},
    width = w - margin.left - margin.right,
    height = h - margin.top - margin.bottom;
    
var x = d3.scaleLinear()
        .range([0, width]);

var y = d3.scaleLinear()
        .range([height, 0]);

// the svg element
var mySVG = d3.select("#graphContainer12")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var background =
    mySVG.append("rect")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("fill-opacity", "0")
	    .attr("fill", "white")
        .on("mousemove", point)
        .on("mouseover", over)
        .on("mouseleave", leave)
        .on("click", click);

var myLine = mySVG.append("path");
var circle = mySVG.append("circle")
                .attr("r", 7)
                .attr("fill", "rgb(205,23,25)")
                .style("opacity", "0")
                .attr("pointer-events", "none")
                .attr("stroke-width", "2.5")
                .attr("stroke", "white");

var xlabelaxis = mySVG.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height/2 + ")") //sets the vertical axis in the middle;

var ylabelaxis = mySVG.append("g")
    .attr("class", "y axis");

function point(){
    var pathEl = myLine.node();
    var pathLength = pathEl.getTotalLength();

    var _x = d3.mouse(this)[0];
    var beginning = _x , end = pathLength, target;
    while (true) {
        target = Math.floor((beginning + end) / 2);
        pos = pathEl.getPointAtLength(target);

        if ((target === end || target === beginning) && pos.x !== _x) {
            break;
        }
        if (pos.x > _x){
            end = target;
        }else if(pos.x < _x){
            beginning = target;
        }else{
            break; //position found
        }
    }
    circle
    .attr("opacity", 1)
    .attr("cx", _x)
    .attr("cy", pos.y);
}

var currentFunction = "fft";

function updateYValues(freq) {
    if (currentFunction == "fft") {
        yValues = fftFunction(plotstart, plotrange, stepsize);
    } else if (currentFunction == "integrand") {
        yValues = integrandFunction(plotstart, plotrange, stepsize, freq);
    } else if (currentFunction == "original") {
        yValues = originalFunction(plotstart, plotrange, stepsize);
    }
}

function click() {
    circle.transition().duration(200).style("fill", "rgb(0,0,0)");

    var freq = 1;
    // Update the function to display.
    if (currentFunction == "fft") {
        var _x = d3.mouse(this)[0];
        freq = _x;
        currentFunction = "integrand";
    } else if (currentFunction == "integrand") {
        currentFunction = "original";
    }
    updateYValues(freq);
    plotLine(xValues, yValues);
}

function over(){
    circle.transition().duration(200).style("opacity", "1");
}
function leave(){
    circle.transition().duration(200).style("opacity", "0");
}

var plotstart = 0, 
    stepsize = 0.1, // in use in this script
    plotrange_real = 5,
    plotrange = plotrange_real + stepsize; // adjusted for the "range" method using stepsize as a 3rd parameter

var yValues, xValues; // declares the values

function fftFunction(startinput, stopinput, steprange)
{ 
    var answer = [];
    for (i = 0; i < 51; i++) {
        answer.push(1);
    }
    return answer;
};

function integrandFunction(startinput, stopinput, steprange, freq) 
{ 
    return d3.range(startinput, stopinput, steprange).map(function(i) 
    {
        return Math.exp(-2 * Math.PI * /*1j **/ (freq * i)) * 
            (Math.cos(2 * Math.PI * 3 * i) * Math.exp(-Math.PI * i * i));
        
    })
};

function originalFunction(startinput, stopinput, steprange) 
{ 
    return d3.range(startinput, stopinput, steprange).map(function(i) 
    {
        return Math.cos(2 * Math.PI * 3 * i) * Math.exp(-Math.PI * i * i);
        
    })
};

function xAxisValues(startinput, stopinput, steprange) 
{ 
    return d3.range(startinput, stopinput, steprange).map(function(i) 
    {
        return i;
    })
};

xValues = xAxisValues(plotstart, plotrange, stepsize); // the generates x-values
yValues = fftFunction(); //these are the y-values, the up and down of the sinuscurve

function plotLine(newXValues, newYValues) {
    // create the domain for the values
    // scale the data to fit in our svg
    var scaleX = d3.scaleLinear()
        .domain([0, d3.max(newXValues)])
        .range([0, width]);

    var scaleY = d3.scaleLinear()
        .domain([d3.min(newYValues), d3.max(newYValues)])
        .range([height, 0]); //remember the order of this one! otherwise you'll get an opposite sinus curve

    // picks out the data for the line
    var line = d3.line()
        .x(function(d) { return scaleX(d.x); }) //we define x and y in the foreach function below (a little unorderly yes, admitted)
        .y(function(d) { return scaleY(d.y); });

    // now need to put both xValues and yValues in the same object to be able to send them to the "line" above in a method we will create below:
    var ourValues = [];

    newXValues.forEach( function (item, index) {     
        ourValues.push( { x: newXValues[index], y: newYValues[index] });   
    });

    // now puts the data into the line function
    // creates the line
    myLine
        .attr("class", "line")
        .datum(ourValues)
        .attr("stroke", function (d) {console.log("what is this"); console.log(d); return "red";})
        .transition().duration(1000)
        .attr("d", line)  // by changing this to myData one can get the unsorted data plotted instead, this is the attribut theat connects the paths to a certain object/array

    //appends the axis to what doesn't exist yet
    var xAxis = d3.axisBottom()
        .scale(x);

    var yAxis = d3.axisLeft()
        .scale(y);

    //Make the axis, have defined x and y at the top already
    x.domain([0, d3.max(ourValues, function(d) 
    { 
        return d.x; 
    })]);


    // y goes from a negative to a positive value
    y.domain([d3.min(ourValues, function(d) 
    { 
        return Math.round(d.y); 
        
    }), 

    d3.max(ourValues, function(d) 
    { 
        return Math.round(d.y); 
        
    })]);

    //The axis and some labels - apparenly there comes some default values from 0.0-1.0 when the axis are added without binding them to some values
    xlabelaxis
        .call(xAxis)

    
    ylabelaxis
        .call(yAxis)
}

plotLine(xValues, yValues);