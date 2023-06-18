// 定义图表的边距和大小
var marginleft2 = { top: 50, right: 40, bottom: 10, left: 30 };

//拿参数
var scriptArgs = new Object();
scriptArgs = getUrlParam('map'); //读取barchar.js的参数 用& 间隔多个参数
var read_data_value= scriptArgs['datatarget']

console.log(read_data_value);
//绘制星座饼图
var nestByXinzuo ;  //all
var pieData=[];  //year []
var pieNestByXinzuo; //year
var ALLpieData;
var ALLpieNestByXinzuo;
d3.csv(read_data_value).then(data => {
	
	nestByXinzuo = d3.groups(data,function(d){
			return d.xinzuo;
	})
	console.log(nestByXinzuo)
	pieData=[]
	nestByXinzuo.forEach(function(item, index){
		if(item[0]!='None' && item[0]!="2002-00-00"&&item[0]!="2017-00-24"){
			pieData.push({
				xinzuo:item[0],
				population: +(item[1].length)
			})
		}
			
	})
	pieNestByXinzuo = d3.group(pieData,d => d.xinzuo);
	console.log(pieNestByXinzuo)
	console.log(pieData)
	drawPieChart();
})

function drawPieChart(){
	var clientRects = d3.select("#left2").node().getBoundingClientRect();
	var piesvg=d3.select("#left2").append("svg")
			.attr("id","piechart2")
			.attr("width","100%")
			.attr("height","100%")
			.attr("preserveAspectRatio","xMidYMid meet")
			.attr("viewBox","0 0 "+clientRects.width/1.001+" "+clientRects.height/1.001);
	var pieunderlow = piesvg.append("g").append("rect")
					.attr("id","pie2underlow")
					.attr("width","100%")
					.attr("height","100%")
					.attr("color","grey")
					.attr("opacity","0.1")
					.on("click",function(){
						console.log("console underlow bar1")
					});
	var pieRects = d3.select("#left2").select("#piechart2").node().getBoundingClientRect();		
	var width = +pieRects.width - marginleft2.left - marginleft2.right;
	var height = +pieRects.height - marginleft2.top - marginleft2.bottom;

	// 创建颜色比例尺
	var maxpo= d3.max(pieData,(d,i)=>{
		return +d.population;
	})
	var colorScale = d3.scaleOrdinal()
	  .domain([0,maxpo])
	  .range( d3.schemeSet3 );
	// 创建路径生成器
	var arc = d3.arc()
	  .innerRadius(0)
	  .outerRadius(Math.min(width, height) / 2 - 10)
	  .cornerRadius(5)
	  .padAngle(0.02);
	
	 // 创建极坐标系生成器
	    const radius = Math.min(width, height) / 2;
	   const angleScale = d3.scaleBand()
	         .domain(pieData.map(d => d.xinzuo))
	         .range([0, Math.PI * 2]);
	// 创建饼图布局
	var pie = d3.pie()
	  .sort(null)
	  .value(d => d.population);
	
	
	// 生成饼图数据
	var arcs = pie(pieData);
	
	// 创建绘图区域
	    const plot = piesvg.append('g')
	      .attr('transform', `translate(${width / 2},${height / 2})`);
	  // 绘制玫瑰图
	      const arcPath = d3.arc()
	        .innerRadius(0)
	        .outerRadius(radius)
	        .startAngle(d => d.startAngle)
	        .endAngle(d => d.endAngle)
	        .padAngle(0.01)
	        .padRadius(radius);
	  
	      plot.selectAll('.arc')
	        .data(arcs)
	        .join('path')
	        .attr('class', 'arc')
	        .attr('d', arcPath)
	        .attr('fill', (d, i) => d3.schemeCategory10[i % 10]);
	// var arcs = piesvg.append("g").selectAll("path")
	//   .data(piedata)
	//   .join("path")
	//   .attr("d", arc)
	//   .attr("fill", (d, i) => colorScale(d))
	//   .attr("opacity",0.75)
	//   .on("mouseenter",function(event,d){
	// 	  console.log("imouseover");
	// 	  d3.select(this).attr("fill","white");
	//   })
	//   .on("mouseleave",function(event,d){
	// 	  d3.select(this).attr("fill",function(d){
	// 		  return colorScale(d);
	// 	  });
	//   })
	//   .on("click",function(event,d){
	// 	  console.log(d.data.xinzuo+' TODO');
	//   })
	//   .attr("transform", `translate(${width / 2}, ${height / 2})`)
	//   .append("title")
	//    .text((d, i) =>{
	//   			//console.log(d.data.xinzuo)
	//   			return  d.data.xinzuo+' :'+d.data.population;
	//   	});
	  // 添加图例
	//   var legend = piesvg.append("g")
	//     .attr("id", "pie2legend")
	//     .attr("transform", `translate(${width - marginleft2.right}, ${marginleft2.top})`);
	// var legendItems = legend.selectAll(".legend-item")
	//   .data(piedata)
	//   .join("g")
	//   .attr("id", "pielegend-item")
	//   .attr("transform", (d, i) => `translate(0, ${i * 15})`);
	// legendItems.append("rect")
	//   .attr("x", "10%")
	//   .attr("y", 0)
	//   .attr("width", "0.9vw")
	//   .attr("height", "0.8vh")
	//   .attr("fill", (d, i) => colorScale(d))
	//   .attr("opacity",0.7)
	//   .append("title")
	//    .text((d, i) =>{
	// 		//console.log(d.data.xinzuo)
	// 		return d.data.xinzuo;
	// 	} );
	
}