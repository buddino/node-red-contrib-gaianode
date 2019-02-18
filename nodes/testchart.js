let Canvas = require('canvas');
let canvas = new Canvas.Canvas(800, 800);
let ctx = canvas.getContext('2d');
let Chart = require('nchart');
let fs = require('fs');

var data = {
    labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
    datasets: [
        {
            label: "My First dataset",
            fillColor: "rgba(220,220,220,0.2)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)",
            data: [65, 59, 80, 81, 56, 55, 40]
        }
    ]
};

let myLineChart = new Chart(ctx).Line(data, {});

canvas.toBuffer(function (err, buf) {
    if (err) throw err;
    fs.writeFileSync('./pie.png', buf);
});