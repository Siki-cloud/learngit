
var mapPadding = {
	top: 40,
	left:10,
	bottom: 20,
	right: 20,
};
var legendWidth = 400;
var legendHeight = 18;
var  legendTop = 8; // 绘制标题区域
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
var nestBySubCategory;// 每个物品类别 对应的各个州的利润

var AllnestBySubState;
var ALLprofitInfoMap=[];
d3.json(read_data_map).then(function(us){
	
		d3.csv( read_data_profit).then(function(arrdata){
			dataUS = arrdata.filter(function(d){
				return d.country == "United States";
			});
			console.log(dataUS)
			
			// all
			dataUS.forEach((item,i) =>{
				item.profit = +item.profit; //转化为数值
				item.sales = +item.sales;
			});
			// 按物品类别重组
			nestBySubCategory = d3.groups(dataUS,function(d){
				return d.subCategory;
			})
			console.log(nestBySubCategory)
			var subCategoryPP=[];
			nestBySubCategory.forEach(function(item,index,array){
				//console.log(item);
				subCategoryPP.push({
					subCategory : item[0],
					subCategoryprofit : item[1]
				});
			})
			nestBySubCategory = d3.group(subCategoryPP,d=>d.subCategory)
			
			// 按洲别重组
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
			
			console.log(nestBySubCategory)
			console.log(nestBySubState)
			console.log(profitInfoMap)
			ALLprofitInfoMap = profitInfoMap;
			AllnestBySubState = nestBySubState;
			drawMap();
			//updateMap('Chairs');
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
	//绘制之前 先在底层设置一层
	var underlow = mapsvg.append("g").append("rect")
	.attr("width",mapWidth)
	.attr("height",mapHeight)
	.attr("fill","gray")
	.attr("opacity","0.1")
	.on("click",function(){
		console.log('map click empty :out!!')
		//d3.select("#barChartTitle").text("sales and profit");
		updateBarChart('all');
		updateLine('all')
	});
	// 绘制区域的边界
	mapsvg.append("g").append("path")
	  .datum(topojson.mesh(mapInfo, mapInfo.objects.states, (a, b) => a !== b))
	  .attr("fill", "none")
	  .attr("stroke", "white")
	  .attr("stroke-width","15")
	  .attr("stroke-linejoin", "round")
	  .attr("d", path)
	  .attr("transform","translate("+mapPadding.top/10+","+mapPadding.left*5+") scale("+scalex+","+scaley+")")
	   ;
	   
	mapsvg.append("g")
	   .attr("class", "regions")
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
	  .attr("stroke","white")
	  .attr("stroke-width","1.0")
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
	  							.attr("stroke","white")
	  							.attr("stroke-width","1.0");
	  })
	  .on("click",function(d,i){
	  						  d3.select(this)
	  						  .attr("stroke","red")
	  						  .attr("stroke-width","2.5");
					console.log(d);
					var selectstate = d.srcElement.__data__.properties.name;
					console.log(selectstate);
					//d3.select("#barChartTitle").text("sales and profit of ",selectstate);
					//updateBarChart(d.srcElement.__data__.properties.name);
					updateBarChart(selectstate);	
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
	  

	
	// 绘制图例
	var legend = mapsvg.append("g")
	  .attr("id", "legend")
	  .attr("transform", "translate(400, 20)");

	
	// 绘制矩形
	// 从颜色的编号映射成图例上的位置
	var x = d3.scaleLinear()
	  .domain([0, color.range().length])
	  .rangeRound([0, legendWidth*3]);
	console.log(legendWidth)
	// 从颜色的编号映射成   利润的数值
	var values = d3.scaleLinear()
	  .domain(x.domain())
	  .range(color.domain());
	  
	legend.selectAll("rect")
	  .data(color.range())
	  .join("rect")
	  .attr("x", (d, i) => x(i)-250)
	  .attr("y", legendTop)
	  .attr("width", (d, i) => x(i + 1) - x(i))
	  .attr("height", legendHeight - legendTop)
	  .attr("fill", d => d);
	// 绘制图例
	
	var title = "Profit (10K $)";
	legend.append("text")
	.attr("id","Legendtitle")
	.text(title)
	.attr("font-size","12px")
	.attr("transform","translate(-250,"+(legendTop/2)+')');
	
	var values = d3.scaleLinear()
	.domain(x.domain())
	.range([minprofit/10000-0.5,maxprofit/10000+0.5]);
	
	
	var legendAxis = d3.axisBottom(x)
	legend.append("g")
	.attr("id","legendAxis")
	.call(legendAxis.ticks(k)
	.tickFormat(function(d){
		return format(values(d));
	}))
	.attr("transform","translate(-250"+","+(legendHeight)+")" );
}

function updateMap(subCategory){
	if(subCategory=="all"){
		d3.select("#MapTitle").text("Area: profits of all categories");
		 nestBySubState = AllnestBySubState;
		 profitInfoMap = ALLprofitInfoMap;
		// drawMap()
		 updateMapByNewProfit()
	}else{
		d3.select("#MapTitle").text("Area: profits of " + subCategory);
		//获取对应subcategory 的利润
		//nestBySubCategory 应该获得每个州上对应类别的利润值。
		var curprofitInfo = nestBySubCategory.get(subCategory)[0]['subCategoryprofit'];
		console.log(curprofitInfo)
		profitInfoMap = [];
		curprofitInfo.forEach(function(item,index) {
			profitInfoMap.push({
				name:item['state'],
				profit: item['profit']
			})
		})
		nestBySubState = d3.group(profitInfoMap,d=>d.name);
		//drawMap()
		updateMapByNewProfit()
	}
}

function updateMapByNewProfit(){
	console.log("update map")
	// 定义颜色比例尺
	var maxprofit= d3.max(profitInfoMap,function(d,i){
		return +d.profit;
	});// nestBySubState is array
	var minprofit = d3.min(profitInfoMap,function(d){
		return +d.profit;
	});
	console.log(maxprofit)
	console.log(minprofit)
	var k = 11;
	var color = d3.scaleQuantize()
			.domain([minprofit, maxprofit])
			.range(  d3.schemePiYG[k] );
	
	//用于取小数位1位
	var format = d3.format(".1f");
	//获取地图 修改颜色
	var mapsvg = d3.select("#Map")
	mapregion = mapsvg.select(".regions").selectAll("path")
	.transition()
	.duration(10)
	.ease(d3.easeLinear)
	.attr("fill", function(d) {
			var obj =nestBySubState.get(d.properties.name);
			var profit = 0;
			if(obj != null ){
				profit = obj[0].profit;
				console.log(profit);
				return    color(profit);
				
			}
			return "grey";
	})
	.attr("transform","translate("+mapPadding.top/10+","+mapPadding.left*5+") scale("+scalex+","+scaley+")")
	.select("title")
	.text(function(d) {
			var obj =nestBySubState.get(d.properties.name);
			var profit = 0;
			if(obj){
				 profit = obj[0].profit;
			}
			//console.log('format(profit)',format(profit))
			return d.properties.name + "\n profit:" +format(profit)  + "$";
	});

	
	//调整比例尺的数值

	var x = d3.scaleLinear()
	  .domain([0, color.range().length])
	  .rangeRound([0, legendWidth*3]);
	  
	var legendAxis = d3.axisBottom(x);
	
	var values = d3.scaleLinear()
	.domain([0, color.range().length])
	.range([minprofit/10000-0.5,maxprofit/10000+0.5]);
	mapsvg.select("#legend").select('#legendAxis')
	.call(legendAxis.ticks(k)
	.tickFormat(function(d){
		return format(values(d));
	}));
}