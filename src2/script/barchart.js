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
	.attr("height", barCharHeight);

//读取数据
var scriptArgs = new Object();
scriptArgs = getUrlParam('barchart'); //读取barchar.js的参数 用& 间隔多个参数
var read_data = scriptArgs['datafile'];
var barData;
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
			subCategory: d.subCategory,
			profit: +d.profit,
			sales: +d.sales //把文本转化为数值 
		};
}).then(function(data) {
	
	barData = utiljoins(data);
	drawBarChart(); //根据barData绘制柱状图
});

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
	
	//定义比例 利润驱动的颜色 利润比例尺
	var maxProfit = d3.max(barData, function(d) {
		return d.profit;
	});
	var color = d3.scaleDiverging()
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
	enterRects.append('rect')
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

	//添加数值
	enterRects.append("text")
		.text(function(d) {
			return d.sales.toFixed(2);
		})
		.attr('x', function(d, i) {
			return barCharPadding.left + xScale(d.sales) * (barCharWidth - barCharPadding.left - barCharPadding.right);
		})
		.attr('y', function(d, i) {
//			console.log(yScale(i))
			return yScale(i) + yScale.bandwidth() / 2 + 5;
		})
		.attr('fill', 'grey')
		.attr('font-size', '12px')

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
		
	//添加比例尺
	
}
