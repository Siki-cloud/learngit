
var mapPadding = {
	top: 40,
	left:10,
	bottom: 20,
	right: 20,
};
var mapWidth =480;
var mapHeight = 480;
var scalex = mapWidth/1000.0;
var scaley= scalex;
console.log(scalex);
console.log(scaley);
//拿参数
var scriptArgs = new Object();
scriptArgs = getUrlParam('map'); //读取barchar.js的参数 用& 间隔多个参数
var read_data_map = scriptArgs['datamap'];
var read_data_profit = scriptArgs['datatarget']
console.log(scriptArgs);
console.log(read_data_map);
console.log(read_data_profit );

var profitInfoMap = [];
var mapInfo;
var nestBySubState;
d3.json(read_data_map).then(function(us){
	
		d3.csv( read_data_profit).then(function(arrdata){
			var dataUS = arrdata.filter(function(d){
				return d.country == "United States";
			});
			dataUS.forEach((item,i) =>{
				item.profit = +item.profit;
			});
			// 按类别重组
			nestBySubState = d3.groups(dataUS,function(d){
				return d.state;
			})
			console.log(nestBySubState);
			nestBySubState.forEach(function(item,index,array){
				var sumprofit = 0;
				item[1].forEach(function(d){
					sumprofit +=d.profit;
				})
				profitInfoMap.push({
					name : item[0],
					profit:sumprofit
					});
			});
			console.log(profitInfoMap);		
			// 按类别重组
			nestBySubState = d3.group(profitInfoMap,d=>d.name)
			mapInfo = us;
			drawMap();
		})
			
	
});
function drawMap(){


	//设置svg 长宽
	var mapsvg = d3.select("#Map")
		.attr("width", mapWidth)
		.attr("height", mapHeight)
		.attr('viewBox', [0, 0, mapWidth, mapHeight]);
		
	var maxprofit= d3.max(profitInfoMap,function(d,i){
		return +d.profit;
	});// nestBySubState is array
	var minprofit = d3.min(profitInfoMap,function(d){
		return +d.profit;
	});
	//d3.interpolateRdBu
	console.log(minprofit);
	console.log(maxprofit);
	var title ="States Profit (%)";
	
	//绘制地图颜色
	var k = 11;
	var color = d3.scaleQuantize()
			.domain([minprofit, maxprofit])
			.range(  d3.schemePiYG[k] );
	
	//设置缩放.);
	// var pro= d3.geoAlbersUsa()
	// .translate([mapWidth/2,mapHeight/2])
	// .scale([450]);
	var format = d3.format(".1f");

	var path = d3.geoPath();
	//	.projection(pro); //设定投影;	
	mapsvg.append("g")
	  .selectAll("path")
	  .data(topojson.feature(mapInfo, mapInfo.objects.states).features)
	  .join("path")
	  .attr("d", path)
	  .attr("fill", function(d) {
		var obj =nestBySubState.get(d.properties.name);
		var profit = 0;
		if(obj != null ){
			profit = obj[0].profit;return    color(profit);
		}
		return "grey";
	  })
	  .on("mouseover",function(d,i){
	                      d3.select(this)
	                         .attr("fill","yellow");
	                  })
	                  .on("mouseout",function(d,i){
	                      d3.select(this)
	                         .attr("fill", function(d) {
	                         		var obj =nestBySubState.get(d.properties.name);
	                         		var profit = 0;
	                         		if(obj != null ){
	                         			profit = obj[0].profit;
										return color(profit);
	                         		}
	                         		return "grey";
	                         })
	                  })
	  .attr("transform","translate("+mapPadding.top/10+","+mapPadding.left*5+") scale("+scalex+","+scaley+")")
	  .append("title")
	  .text(function(d) {
		var obj =nestBySubState.get(d.properties.name);
		var profit = 0;
		if(obj){
			 profit = obj[0].profit;
		}
		return d.properties.name + "\n profit:" +format(profit)  + "$";
	  });
	  

	// 绘制区域的边界
	mapsvg.append("g").append("path")
	  .datum(topojson.mesh(mapInfo, mapInfo.objects.states, (a, b) => a !== b))
	  .attr("fill", "none")
	  .attr("stroke", "white")
	  .attr("stroke-linejoin", "round")
	  .attr("d", path)
	  .attr("transform","translate("+mapPadding.top/10+","+mapPadding.left*5+") scale("+scalex+","+scaley+")")
	// 绘制图例
	var legend = mapsvg.append("g")
	  .attr("id", "legend")
	  .attr("transform", "translate(400, 20)");
	var legendWidth = 200,
	  legendHeight = 18,
	  legendTop = 8; // 绘制标题区域
	
	// 绘制矩形
	// 从颜色的编号映射成图例上的位置
	var x = d3.scaleLinear()
	  .domain([0, color.range().length])
	  .rangeRound([0, legendWidth]);
	// 从颜色的编号映射成   利润的数值
	var values = d3.scaleLinear()
	  .domain(x.domain())
	  .range(color.domain());
	  
	legend.selectAll("rect")
	  .data(color.range())
	  .join("rect")
	  .attr("x", (d, i) => x(i)-150)
	  .attr("y", legendTop)
	  .attr("width", (d, i) => x(i + 1) - x(i))
	  .attr("height", legendHeight - legendTop)
	  .attr("fill", d => d);
	// 绘制图例
	var title = "Profit (10K $)";
	legend.append("text")
	.attr("calss","title")
	.text(title)
	.attr("font-size","12px")
	.attr("transform","translate(-150,"+(legendTop/2)+')');
	
	var values = d3.scaleLinear()
	.domain(x.domain())
	.rangeRound([minprofit/10000,maxprofit/10000]);
	
	
	var legendAxis = d3.axisBottom(x)
	legend.append("g")
	.call(legendAxis.ticks(k)
	.tickFormat(function(d){
		return values(d);
	}))
	.attr("transform","translate(-150,"+(legendHeight)+")" );
}