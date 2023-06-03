//document.write("<script src='readargs.js'></script>");
//import './readargs.js'
var barCharWidth = 480;
var barCharHeight = 480;
var barCharPadding = {
	top: 20,
	left: 70,
	bottom: 40,
	right: 30,
};
//设置svg 长宽
var barChart = d3.select("#CatergoryChart")
	.attr("width", barCharWidth)
	.attr("height", barCharHeight)
	.attr('viewBox', [0, 0, barCharHeight, barCharHeight]);

//读取数据
var scriptArgs = new Object();
scriptArgs = getUrlParam('barchart'); //读取barchar.js的参数 用& 间隔多个参数
var read_data = scriptArgs['datafile'];
var barData;
var barBySate;
var ALLbarData;

//var totalcolor;
// 累加相同key 的data
function utiljoins(arrdata){
	var tmpmap={};  // map:{物品名称-[profit,sales]}
	
	for(var i =0; i<arrdata.length; i++ ){
		var obj = arrdata[i];
		var key = obj['subCategory'];  // 物品名称
		if(!tmpmap[key] && tmpmap[key] !=0){
			//不存在了
			tmpdata =[];
			tmpdata.push(obj['profit']);//profite
			tmpdata.push(obj['sales']);//sales
			tmpmap[key] = tmpdata;
			}
		else{
			var value = tmpmap[key];
			value[0]  += obj['profit']; //profite
			value[1]  += obj['sales'] ; //sales
			tmpmap[key] = value;
		}
	}
	var data = [];
	for(key in tmpmap){
		data.push({
			subCategory: key,
			profit: tmpmap[key][0],
			sales: +tmpmap[key][1] / 1000 //把文本转化为数值 
		})
	}
	return data;
}

d3.csv( read_data , function(d) {
	if (d.country == "United States")
		return {
			state:d.state,
			subCategory: d.subCategory,
			profit: +d.profit,
			sales: +d.sales //把文本转化为数值 
		};
}).then(function(data) {
	console.log(data);
	barBySate= d3.groups(data,function(d){
		return d.state;
	});
	console.log(barBySate);
	var statePP=[];
	barBySate.forEach(function(item,index,array){
		//console.log(item);
		statePP.push({
			state : item[0],
			state_sale_profit : item[1]
		});
	});
	barBySate = d3.group(statePP,d => d.state);
	console.log(barBySate);
	barData = utiljoins(data);
	ALLbarData=barData; //存储all全局的bar
	
	drawBarChart(); //根据barData绘制柱状图
	
	//updateBarChart("Texas")
});
function drawReferenceLine(){
		  //绘制参考线
		  var reference = barChart.append("g")
			  .attr("class","reference")
			  .attr("visibility","hidden");
		  reference.append("line")
			  .attr("x1",0)
			  .attr("x2",0)
			  .attr("y1",barCharPadding.top)
			  .attr("y2",barCharHeight-barCharPadding.bottom)
			  .attr("stroke","grey");
		  reference.append("text")
			  .text("");
	  }

function drawBarChart() {
	console.log(barData)
	//水平比例尺
	var maxSales = d3.max(barData, function(d) {
		return d.sales;
	});
	var xScale = d3.scaleLinear()
		.domain([0, maxSales]).nice() //输入值的范围
		//.range([barCharPadding.left,barCharWidth-barCharPadding.right]);//输出位置范围[30-450]
		.range([0, 1]);

	//垂直比例尺
	var yScale = d3.scaleBand()
		.domain(d3.range(barData.map(function(d) {
			return d.subCategory;
		}).length)) // 得到所有类别信息
		.rangeRound([barCharPadding.top, barCharHeight - barCharPadding.bottom]) //[30-450] set the output range
		.paddingInner(0.3); //设置柱状体间隔
	
	//在绘制柱状体提前垫入一层底层 方便选中空白区域
	
	var referenceRect = barChart.insert("g", "#rects").append("rect")
	        .attr("width",barCharWidth)
	        .attr("height",barCharHeight)
			//.attr('transform','translate('+barCharPadding.left+','+barCharPadding.top+')')
	        .attr("fill", "gray")
	        .attr("opacity", "0.05");
	
	
	//定义比例 利润驱动的颜色 利润比例尺
	var maxProfit = d3.max(barData, function(d) {
		if (d.profit<0)
			return -d.profit;
		return d.profit;
	});
	
	var color = d3.scaleDiverging()
		.domain([-maxProfit, maxProfit])
		.interpolator(d3.interpolateRdBu);
	totalcolor =d3.scaleDiverging()
		.domain([-maxProfit, maxProfit])
		.interpolator(d3.interpolateRdBu);
	// 绘制比例尺 图例
	legendWidth=  barCharWidth/5;
	legendHeight = 20;
	legendTop = 10;
	
	var legend = barChart.append('g')
		.attr("id","legend")
		.attr('transform','translate('+barCharWidth/1.3+','+10 +')');
	var numcolor = d3.scaleLinear()
		.domain([0, color.range().length])
		.rangeRound([0, legendWidth]);
	var values = d3.scaleLinear()
		.domain(numcolor.domain)
		.range(color.domain);
	legend.selectAll("rect")
		.data(color.range())
		.join("rect")
		.attr("x",(d,i) => numcolor(i)  )
		.attr('y',barCharHeight - legendTop*6.5)
		.attr("width",(d,i) => numcolor(i+1) - numcolor(i))
		.attr("height",legendHeight - legendTop)
		.attr("fill",d => d);
	
	var title = "Profit(small - > large)";
	legend.append("text")
		.attr("class","title")
		.text(title)
		.attr("font-size","12px")
		.attr("transform",'translate('+-10+',410)');
		
	//绑定数据
	var bindings = d3.select("#rects").selectAll("rect")
		.data(barData);
	var updateRects = bindings;
	var enterRects = bindings.enter();
	var exitRects = bindings.exit();

	
	//绘制柱状体
	var bars = enterRects.append('rect')
		.attr("calss","mainbars")
		.attr("width", function(d, i) {
			return xScale(d.sales) * (barCharWidth - barCharPadding.left - barCharPadding.right);
		})
		.attr("height", yScale.bandwidth()) //bandwith 查看每个柱状体的宽度
		.attr("x", function(d, i) {
			return barCharPadding.left; //x始终是 第一个位置
		})
		.attr("y", function(d, i) {
			return yScale(i);

		})
		.style("fill", function(d, i) {
			return color(d.profit)
		});
		
		// 添加  鼠标交互 
		bars.on("mouseover",function(event){
			console.log('mouseover')
			d3.select(this).style("fill",'yellow')
		})
		.on("mouseout",function(event){
			console.log('mouseover')
			bars.style("stroke","none");
			d3.select(this).style("fill", function(d, i) {
			return color(d.profit)
			})
		})
		.on("click",function(event,d){
			bars.style("stroke","none");
			d3.select(this)
			.style("stroke","red")
			.append("title")
			.text(function(d) {
			  str= 'sale:'+ d3.format(".1f")(d.sales) +'\nprofit:'+d3.format(".1f")(d.profit);
			  return str
			});
			console.log(d.subCategory)
			updateMap(d.subCategory)
			updateLine(d.subCategory,d.profit,totalcolor)
		});
		
	drawReferenceLine();
	referenceRect.on("click",function(event){
		console.log("empty!!!!")
		bars.style("stroke", "none");
		updateMap("all");
		updateLine("all",404,totalcolor)
		updateline(d3.pointer(event)[0]);
		});
	
	
	//添加x y轴坐标
	var ytag = d3.scaleBand().domain(barData.map(function(d) {
			return d.subCategory;
		}))
		.range([barCharPadding.top, barCharHeight - barCharPadding.bottom])
		.paddingInner(0.3)
	var yAxis = d3.axisLeft(ytag)
	d3.select("#yAxis").call(yAxis)
		.attr("transform", "translate(" + (barCharPadding.left - 1) + "," + 0 + ")")
		.style("color", "grey")
		.style("font-color", "black")

	var xtag = d3.scaleLinear().domain([0, maxSales]).range([barCharPadding.left, barCharWidth - barCharPadding
		.right
	])
	var xAxis = d3.axisBottom(xtag)
	d3.select("#xAxis").call(xAxis)
		.attr("transform", "translate(" + 0 + "," + (barCharHeight - barCharPadding.bottom) + ")")
		.style("color", "grey")
		.style("font-color", "black")

	//设置x轴文字
	d3.select("#xtag")
		.append("text")
		.text("sales:(k)")
		.attr("transform", "translate(" + (barCharWidth - barCharPadding.right * 2) + "," + (barCharHeight -
			barCharPadding.bottom / 5) + ")")
		.attr("font-family", "sans-serif")
		.attr("font-size", "13px")
		.attr("fill", "blue");
		
	//添加比例线性的文字
	function updateline(coordx){
			  console.log(coordx)
			  var value = xtag.invert(coordx);
			  var referenceline = d3.select(".reference")
								.attr("visibility","visible");
			  referenceline.select("line")
						.attr("x1",coordx)
						.attr("x2",coordx)
			  referenceline.select("text")
						.text(d3.format(".1f")(value))
						.attr("x",coordx)
						.attr("y",30);
				referenceline.on("click",function(){
					d3.select(".reference")
					.attr("visibility","hidden");
				})
	}
}

function updateBarChart(state){
	
	
	if(state =="all"){
		d3.select("#barChartTitle").text("Categories：sales and profit");
		barData = ALLbarData;
		redrawBarChart();
		updateLine('all',-1,totalcolor);
	}
	else{
		d3.select("#barChartTitle").text("Categories：sales and profit of "+state);
		console.log(state)
		var curinfo = barBySate.get(state)[0]['state_sale_profit']
		console.log(curinfo)
		curinfo.forEach((item,index) =>{
			
		})
		barData = utiljoins(curinfo);
		//绑定数据
		redrawBarChart()
		
	}
}
function redrawBarChart(){

	console.log(barData);
	//水平比例尺
	var maxSales = d3.max(barData, function(d) {
		return d.sales;
	});
	var xScale = d3.scaleLinear()
		.domain([0, maxSales]) //输入值的范围
		//.range([barCharPadding.left,barCharWidth-barCharPadding.right]);//输出位置范围[30-450]
		.range([0, 1]);
	
	//垂直比例尺
	var yScale = d3.scaleBand()
		.domain(d3.range(barData.map(function(d) {
			return d.subCategory;
		}).length)) // 得到所有类别信息
		.rangeRound([barCharPadding.top, barCharHeight - barCharPadding.bottom]) //[30-450] set the output range
		.paddingInner(0.3); //设置柱状体间隔
	
	//定义比例 利润驱动的颜色 利润比例尺
	var maxProfit = d3.max(barData, function(d) {
		if (d.profit<0)
			return -d.profit;
		return d.profit;
	});
	
	var color = d3.scaleDiverging()
		.domain([-maxProfit, maxProfit])
		.interpolator(d3.interpolateRdBu);
	totalcolor = d3.scaleDiverging()
		.domain([-maxProfit, maxProfit])
		.interpolator(d3.interpolateRdBu);
	//绑定数据
	//d3.select("#rects").remove();
	console.log('dELLL111')
	var bindings = d3.select("#rects").selectAll("rect")
	.data(barData)
	.join('rect');
	//var enterRects = bindings.enter().append("rect");
	var updateRects = bindings;
	
	updateRects.on("mouseover",function(event){
		console.log('mouseover')
		d3.select(this).style("fill",'yellow')
	})
	.on("mouseout",function(event){
		console.log('mouseout')
		
		d3.select(this).
		style("fill", function(d, i) {
		return color(d.profit)
		})
		.style("stroke","none");
	})
	.on("click",function(event,d){
		console.log('click')
		d3.select(this)
		.style("stroke","red")
		.append("title")
		.text(function(d) {
		  str= 'sale:'+ d3.format(".1f")(d.sales) +'\nprofit:'+d3.format(".1f")(d.profit);
		  return str
		});
		console.log(d.subCategory)
		console.log(d3.select(this).color)
		updateMap(d.subCategory)
		updateLine(d.subCategory,d.profit,totalcolor)
	});
	
	//绘制柱状体
		updateRects.transition()
		.duration(400)
		.ease(d3.easeLinear)
			.attr("width", function(d, i) {
				return xScale(d.sales) * (barCharWidth - barCharPadding.left - barCharPadding.right);
			})
			.attr("height", yScale.bandwidth()) //bandwith 查看每个柱状体的宽度
			.attr("x", function(d, i) {
				return barCharPadding.left; //x始终是 第一个位置
			})
			.attr("y", function(d, i) {
				return yScale(i);
	
			})
			.style("fill", function(d, i) {
				return color(d.profit)
			});
		
		
	//更新x y轴坐标
	var ytag = d3.scaleBand().domain(barData.map(function(d) {
			return d.subCategory;
		}))
		.range([barCharPadding.top, barCharHeight - barCharPadding.bottom])
		.paddingInner(0.3)
	var yAxis = d3.axisLeft(ytag)
	d3.select("#yAxis").call(yAxis)
		.attr("transform", "translate(" + (barCharPadding.left - 1) + "," + 0 + ")")
		.style("color", "grey")
		.style("font-color", "black")
	//设置x轴文字
	var xtag = d3.scaleLinear().domain([0, maxSales]).range([barCharPadding.left, barCharWidth - barCharPadding
		.right
	])
	var xAxis = d3.axisBottom(xtag)
	d3.select("#xAxis").call(xAxis)
		.attr("transform", "translate(" + 0 + "," + (barCharHeight - barCharPadding.bottom) + ")")
		.style("color", "grey")
		.style("font-color", "black")

	
	//X
	var exitRects = bindings.exit()
					.remove();
	
}