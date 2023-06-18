// 定义边距和绘图区域的宽度和高度
var marginright1 ={top: 30, right: 20, bottom: 100, left: 40}// { top: 50, right: 20, bottom: 100, left: 30 };
//拿参数
var scriptArgs = new Object();
scriptArgs = getUrlParam('map'); //读取barchar.js的参数 用& 间隔多个参数
var read_data_value= scriptArgs['datatarget']

console.log(read_data_value);
//绘制散点图饼图 粉丝人数的分布
var nestByFollow ;  //all
var scotterData=[];  //year []
var scotrerNestByFollow; //未用到
var ALLscotterData;

d3.csv(read_data_value).then(data => {
	ALLscotterData =data
	nestByFollow = d3.groups(data,function(d){
			return d.screen_name;
	})
	console.log(nestByFollow)
	scotterData=[]
	nestByFollow.forEach(function(item, index){
		var vf =0;
		var ff=+item[1][0]['followers_count'];
		var fr = +item[1][0]['friends_count'];
		//console.log(item[1])
		if (item[1][0]['verified']=="True")
			vf=1
			
		if (ff>1 && fr>1){
			scotterData.push({
				x: +(ff),
				y: +(fr),
				size:+(item[1][0]['mbrank']),
				verified:vf,
				name:(item[1][0]['screen_name'])
			})
		}
		
		
			
	})
	
	console.log(nestByFollow)
	console.log(scotterData)
	drawScotterChart();
})
function drawScotterChart(){
	
	// 获取窗口的宽度和高度
	var scRects= d3.select("#right1").node().getBoundingClientRect();
	
	var width = scRects.width - marginright1.left - marginright1.right;
	var height = scRects.height - marginright1.top - marginright1.bottom;
	// 创建 SVG 容器
	var scosvg=d3.select("#right1").append("svg")
			.attr("id","scotterRight1")
			.attr("width", "100%")
			.attr("height", "100%")
			.attr('viewBox', `0 0 ${scRects.width} ${scRects.height}`)
			.attr('preserveAspectRatio', 'xMidYMid meet');
	// 创建比例尺，将数据映射到绘图区域
	var maxpox = d3.max(scotterData,d=>d.x)
	//d3.max(scotterData.filter(d => d.x != maxpox),j=>j.x)
	var xScale = d3.scaleLog()  //scaleLog
	  .domain([1, maxpox])  // x 值的范围
	  .range([0,width]);// x 轴的范围
	
	var yScale = d3.scaleLinear()
	  .domain([0, d3.max(scotterData, d => d.y)])  // y 值的范围
	  .range([height,0]);  // y 轴的范围
	  
	//size
	var sizeScale= d3.scaleLinear()
		.domain([0,d3.max(scotterData,d=>d.size)])
		.range([1,8])
	var VFcolor=  d3.scaleOrdinal()
			.domain([0,1])
			.range(d3.schemePastel1 );
	// 创建绘图区域
	var plot = scosvg.append("g").attr("id","plotright1");
	
	
	// 创建 x 和 y 坐标轴
	var tickCount = 10;
	var yAxis = d3.axisLeft(yScale).tickFormat(d => d/1000 + "k");
	// 绘制 x 坐标轴
	var xAxis = d3.axisBottom(xScale).ticks(tickCount);
	plot.append("g")
		.attr("id", "scotterxAxis")
		.style("color", "white")
		.style("opacity","0.5")
		.attr("transform", `translate(0, ${height})`)
		.call(xAxis);
	
	// 绘制 y 坐标轴
	plot.append("g")
			.attr("id", "scotteryAxis")
			.style("color", "grey")
			.style("opacity","0.7")
			//.attr("transform", `translate(${marginright1.left}, 0)`)
			.call(yAxis);
	// 添加 x 坐标轴标签
	plot.append("text")
	  .attr("id", "scx-axis-label")
	  .attr("x", (width ) / 2 + marginright1.left/2)
	  .attr("y", height +marginright1.bottom/3)
	  .attr("text-anchor", "middle")
	  .attr("fill","white")
	  .attr("font-size","0.8vw")
	  .attr("opacity","0.6")
	  .text("粉丝数 ");

	// 添加 y 坐标轴标签
	plot.append("text")
	  .attr("id", "scy-axis-label")
	  .attr("x", marginright1.left)
	  .attr("y", marginright1.top/7)//
	  .attr("text-anchor", "middle")
	 // .attr("transform", "rotate(-90)")
	  .attr("fill","white")
	  .attr("font-size","0.8vw")
	  .attr("opacity","0.6")
	  .text("关注数");
	// 绘制散点
	plot.selectAll("circle")
	  .attr("id","circleRight1")
	  .data(scotterData)
	  .join("circle")
	  .attr("cx", d => xScale(d.x))
	  .attr("cy", d => yScale(d.y))
	  .attr("r", d=>sizeScale(d.size))  // 设置散点的半径
	  .attr("stroke","white")
	  .attr("stroke-width",0.5)
	  .attr("fill", d=>VFcolor(d.verified))
	  .attr("opacity","0.5") // 设置散点的颜色
	  .on("mouseover",function(event,d){
		  d3.select(this).attr("fill","white")
		  .attr("stroke","red")
	  })
	  .on("mouseout",function(event,d){
	  		  d3.select(this).attr("fill", d=>VFcolor(d.verified))
			  .attr("stroke","white")
	  })
	  .on("click",function(event,d){
		  console.log(d.size)
		  updataMapByMbrank(d.size);
	  })
	 
	  .append("title")
	  .attr("id","scotterlabel")
	  .text(function(d,i){
		  return d.name+'\nfan:'+d.x+' att:'+d.y+'\nrank:'+d.size;
	  });
	plot.attr('transform', `translate(${marginright1.left}, ${marginright1.top})`);
	
	// 添加标题
	 plot.append("text")
	  .attr("id", "scotterTitle")
	  .attr("x", width /3)
	  .attr("y", marginright1.top/7)
	  .attr("text-anchor", "right")
	  .text("pink：未认证，blue：认证")
	  .attr("font-size","1.5vh")
	  .attr("opacity","0.7")
	  .attr("fill","white");
	
	 
	// 监听窗口大小变化事件，并重新绘制散点图
	window.addEventListener("resize", function() {
	  // 更新窗口的宽度和高度
	  var scRects= scosvg.node().getBoundingClientRect();
	  
	   width = scRects.width - marginright1.left - marginright1.right;
	   height = scRects.height - marginright1.top - marginright1.bottom;
	
	  // 更新 x 和 y 比例尺的范围
	  xScale.range([0,width]);
	  yScale.range([height,0]);
	
	  // 更新绘图区域的位置
	  plot.attr("transform", "translate(" + marginright1.left + "," + marginright1.top + ")");
	
	  // 更新散点的位置
	  plot.selectAll("circle")
	    .attr("cx", d => xScale(d.x))
	    .attr("cy", d => yScale(d.y));
	
	  // 更新 x 坐标轴
	  xAxis.scale(xScale);
	  yAxis.scale(yScale);
	  plot.select("#scotterxAxis")
	   .attr('transform', `translate(0, ${height})`)
	    .call(xAxis);
	
	  // 更新 y 坐标轴
	  plot.select("#scotteryAxis")
	    .call(yAxis);
	//标题
	plot.select("#scotterTitle")
	 .attr("x", width /3)
	 .attr("y", marginright1.top/7)
	});
	plot.select("#scy-axis-label")
	.attr("x", marginright1.left)
	.attr("y", marginright1.top/7);
	
	plot.select("#scx-axis-label")
	  .attr("x", (width ) / 2 + marginright1.left/2)
	  .attr("y", height+marginright1.bottom/3);
}

function updateright1(province){
	scotterData=[]
	if (province=='all'){
		nestByFollow.forEach(function(item, index){
			var vf =0;
			var ff=+item[1][0]['followers_count'];
			var fr = +item[1][0]['friends_count'];
			//console.log(item[1])
			if (item[1][0]['verified']=="True")
				vf=1
				
			if (ff>1 && fr>1){
				scotterData.push({
					x: +(ff),
					y: +(fr),
					size:+(item[1][0]['mbrank']),
					verified:vf,
					name:(item[1][0]['screen_name'])
				})
			}
		})
	}
	else{
		console.log(ALLscotterData)
		var tempp = ALLscotterData.filter(function(d){
				return d["location"] == province;
			})
		tempp.forEach(function(item, index){
			var vf =0;
			var temp = item
			var ff=+temp['followers_count'];
			var fr = +temp['friends_count'];
			//console.log(item[1])
			if (temp['verified']=="True")
				vf=1
				
			if (ff>1 && fr>1){
				scotterData.push({
					x: +(ff),
					y: +(fr),
					size:+(temp['mbrank']),
					verified:vf,
					name:(temp['screen_name'])
				})
			}
		})
	}
	console.log(scotterData)
	updataScotterInstance();
}
function updataScotterInstance(){
	// 获取窗口的宽度和高度
	var scRects= d3.select("#right1").node().getBoundingClientRect();
	
	var width = scRects.width - marginright1.left - marginright1.right;
	var height = scRects.height - marginright1.top - marginright1.bottom;
	// 创建 SVG 容器
	var scosvg=d3.select("#right1").select("#scotterRight1");
	// 创建比例尺，将数据映射到绘图区域
	var maxpox = d3.max(scotterData,d=>d.x)
	
	var xScale = d3.scaleLog()  //scaleLog
	  .domain([1, maxpox])  // x 值的范围
	  .range([0,width]);// x 轴的范围
	
	var yScale = d3.scaleLinear()
	  .domain([0, d3.max(scotterData, d => d.y)])  // y 值的范围
	  .range([height,0]);  // y 轴的范围
	  
	//size
	var sizeScale= d3.scaleLinear()
		.domain([0,d3.max(scotterData,d=>d.size)])
		.range([1,8])
	var VFcolor=  d3.scaleOrdinal()
			.domain([0,1])
			.range(d3.schemePastel1 );
	var plot = d3.select("#right1").select("#scotterRight1").select("#plotright1")
	//x y
	// 创建 x 和 y 坐标轴
	var tickCount = 10;
	var yAxis = d3.axisLeft(yScale).tickFormat(d => d/1000 + "k");
	// 绘制 x 坐标轴
	var xAxis = d3.axisBottom(xScale).ticks(tickCount);
	plot.select("#scotterxAxis")
		.style("color", "white")
		.style("opacity","0.5")
		.attr("transform", `translate(0, ${height})`)
		.call(xAxis);
	
	// 绘制 y 坐标轴
	plot.select("#scotteryAxis")
			.style("color", "grey")
			.style("opacity","0.7")
			.call(yAxis);
	// 更新散点的位置
	var scplot = plot.selectAll("circle")
		.data(scotterData)
		 .join("circle");
	
	scplot.on("mouseover",function(event,d){
				  d3.select(this).attr("fill","white")
				  .attr("stroke","red")
		})
		.on("mouseout",function(event,d){
				  d3.select(this).attr("fill", d=>VFcolor(d.verified))
					  .attr("stroke","white")
		})
		.on("click",function(event,d){
				  console.log(d.size)
				  updataMapByMbrank(d.size);
		});
	scplot.transition()
			.duration(450)
			.ease(d3.easeLinear)
			.attr("cx", d => xScale(d.x))
			.attr("cy", d => yScale(d.y))
			.attr("r", d=>sizeScale(d.size))  // 设置散点的半径
			.attr("stroke","white")
			.attr("stroke-width",0.5)
			.attr("fill", d=>VFcolor(d.verified))
			.attr("opacity","0.5") // 设置散点的颜色;
		
			 
	scplot.select("#scotterlabel")
		.text(function(d,i){
				  return d.name+'\nfan:'+d.x+' att:'+d.y+'\nrank:'+d.size;
		});
}