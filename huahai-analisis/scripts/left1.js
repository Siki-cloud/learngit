// 定义图表的边距和大小
var marginleft1 = { top: 70, right: 20, bottom: 20, left: 50 };

//拿参数
var scriptArgs = new Object();
scriptArgs = getUrlParam('map'); //读取barchar.js的参数 用& 间隔多个参数
var read_data_value= scriptArgs['datatarget']

console.log(read_data_value);
//绘制年龄曲线图
var nestByYear ;  //all
var barData=[];  //year []
var barNestByYear; //year
var ALLbarData;
d3.csv(read_data_value).then(data => {
	
	nestByYear = d3.groups(data,function(d){
			return d.year;
	})
	console.log(nestByYear)
	barData=[]
	nestByYear.forEach(function(item, index){
		if (item[0]!='-1')
			barData.push({
				year:item[0],
				population:+(item[1].length)
			})
	})
	
	barNestByYear = d3.group(barData,d => d.year);
	console.log(barNestByYear)
	console.log(barData)
	drawBarChart();
})

function drawBarChart(){
	// 用barNestByYear ：map  barData：[]  绘制柱状图
	var maxpo = d3.max(barData,(d,i)=>{
		return +d.population;
	})
	
	
	// 设置图形
	var barsvg = d3.select("#left1").append("svg")
				.attr("id","barchart1")
				.attr("width","100%")
				.attr("height","100%");
				//.attr("preserveAspectRatio","xMidYMid meet")
				//.attr("viewBox","0 0 10 10");
				//.attr("viewBox","0 0 "+clientRects.width/1.001+" "+clientRects.height/1.001);
	var cbRects = d3.select("#left1").select("#barchart1").node().getBoundingClientRect();
	var width = +cbRects.width - marginleft1.left - marginleft1.right;
	var height = cbRects.height - marginleft1.top - marginleft1.bottom;

	
	// 创建缩放函数
	var xScale = d3.scaleBand()
	  .domain(d3.range(barData.length))
	  .range([marginleft1.left, width - marginleft1.right])
	  .padding(0.1);
	var xtag= d3.scaleBand()
			.domain(barData.map(function(d){
				return d.year;
			}))
			.range([marginleft1.left, width - marginleft1.right])
			.padding(0.1);
			
	//垂直比例尺
	var yScale = d3.scaleLinear()
		.domain([0,maxpo]) // 得到所有类别信息
		.rangeRound([height - marginleft1.bottom, marginleft1.top]) ;//[30-450] set the output range
		//.paddingInner(0.3); //设置柱状体间隔
	var ytag =d3.scaleLinear()
			.domain([0,maxpo/100])
			.rangeRound([height - marginleft1.bottom, marginleft1.top]) ;
	//颜色比例尺
	//绘制地图颜色
	var k = 9;
	var color = d3.scaleQuantize()
			.domain([-maxpo,0])
			.range(  d3.schemeSpectral[k] );
			
	//绘画之前，垫一层白板
	 barsvg=barsvg.append('g')
					.attr("id","bar1underlow")
					.attr("width","100%")
					.attr("height","100%")
					.attr("color","grey")
					.on("click",function(){
						console.log("console underlow bar1")
						updataleft1("全国");
					});
	d3.select("left1").on("click",function(){
						console.log("console underlow bar1")
						updataleft1("全国");
					});
	// 创建x轴和y轴
	 var xAxis = d3.axisBottom(xtag);
	 var yAxis = d3.axisLeft(yScale).tickFormat(d => d/100 + "B").ticks(5);
	 // 添加x轴和y轴
	 barsvg.append("g")
	   .attr("id", "bar1xAxis")
			.style("color", "grey")
	   .attr("transform", `translate(0, ${height - marginleft1.bottom})`)
	   .call(xAxis);
	 
	 barsvg.append("g")
	   .attr("id", "bar1yAxis")
			.style("color", "grey")
	   .attr("transform", `translate(${marginleft1.left}, 0)`)
	   .call(yAxis);
	// 添加标题
	 barsvg.append("text")
	  .attr("id", "bar1Title")
	  .attr("x", width /2)
	  .attr("y", marginleft1.top/2)
	  .attr("text-anchor", "middle")
	  .text("全国参与人年龄段分布")
	  .attr("font-size","1.5vh")
	  .attr("opacity","0.7")
	  .attr("fill","white");
	// 创建柱状图
	barsvg.attr("id","bar1rects")
		.selectAll("rect")
	  .data(barData)
	  .join("rect")
	  .attr("x", (d, i) => {
		  //console.log(i,d,xScale(i))
		  return xScale(i);
	  })
	  .attr("y", d => yScale(d.population))
	  .attr("width", xScale.bandwidth())
	  .attr("height", d => {
		 // console.log(maxpo,d.population)
		//  console.log(height,  margin.bottom  ,yScale(d.population));
		  return height - marginleft1.bottom - yScale(d.population);
	  })
	  .attr("fill", d=>{
		  return color(-d.population)
	  })
	  .attr("stroke","white")
	  .attr("stroke-width",0.5)
	  .attr("opacity","0.8")
	  .on("mouseover",function(event,d){
		  console.log("bar1char mvover")
		  d3.select(this).attr("fill","white")
		  .attr("stroke","red");
	  })
	  .on("mouseout",function(event,d){
		   console.log("bar1char out")
		  d3.select(this).attr("fill",function(d){
			  return color(-d.population);
		  }).attr("stroke","white");
	  })
	  .on("click",function(event,d){
		  console.log(d.year," :在全国的参与TODO");
		 
		  updateMapByYear(d.year);
	  })
	  .append("title")
	  .text(function(d,i){
		  return d.year+'后:'+d.population;
	  });
	  
	  
	 
	// 监听窗口大小变化事件
	window.addEventListener("resize", function() {
	  // 更新图表的宽度和高度
	 var cbRects = d3.select("#left1").select("#barchart1").node().getBoundingClientRect();
	  width = +cbRects.width - marginleft1.left - marginleft1.right;
	  height = cbRects.height - marginleft1.top - marginleft1.bottom;
	
	  // 更新缩放函数的范围
	  xScale.range([marginleft1.left, width - marginleft1.right]);
	  yScale.range([height - marginleft1.bottom, marginleft1.top]);
		
	// 更新x轴和y轴的位置和刻度
	  barsvg.select("#bar1xAxis")
	    .attr("transform", `translate(0, ${height - marginleft1.bottom})`)
	    .call(xAxis);
	
	  barsvg.select("#bar1yAxis")
	    .attr("transform", `translate(${marginleft1.left}, 0)`)
	    .call(yAxis);

	  // 更新柱状图的位置和大小
	  barsvg.selectAll("rect")
	    .attr("x", (d, i) => xScale(i))
	    .attr("y", d => yScale(d.population))
	    .attr("width", xScale.bandwidth())
	    .attr("height", d => height - marginleft1.bottom - yScale(d.population));
	});
	 // 更新标题位置
	  barsvg.select("#bar1Title")
	    .attr("x", width / 2)
	    .attr("y", marginleft1.top / 2);
}

function updataleft1(province){
	
	barData=[]
	if (province=="全国"){
		nestByYear.forEach(function(item,i){
			if(item[0]!='-1'){
				
				barData.push({
					year:item[0],
					population:+(item[1].length)
				})
			}
		})
	}
	else{
		nestByYear.forEach(function(item,i){
			if(item[0]!='-1'){
				var temp = item[1].filter(function(d){
					return d.location == province;
				});
				console.log(temp)
				barData.push({
					year:item[0],
					population:+(temp.length)
				})
			}
		})
	}
	
	barNestByYear = d3.group(barData,d => d.year);
	console.log(barNestByYear)
	console.log(barData)
	updatabarInstance(province)
}
function updatabarInstance(province){
	//更新比例尺
	// 用barNestByYear ：map  barData：[]  绘制柱状图
	var maxpo = d3.max(barData,(d,i)=>{
		return +d.population;
	})
	var cbRects = d3.select("#left1").select("#barchart1").node().getBoundingClientRect();
	var width = +cbRects.width - marginleft1.left - marginleft1.right;
	var height = cbRects.height - marginleft1.top - marginleft1.bottom;
	
	// 创建缩放函数
	var xScale = d3.scaleBand()
	  .domain(d3.range(barData.length))
	  .range([marginleft1.left, width - marginleft1.right])
	  .padding(0.1);
	var xtag= d3.scaleBand()
			.domain(barData.map(function(d){
				return d.year;
			}))
			.range([marginleft1.left, width - marginleft1.right])
			.padding(0.1);
			
	//垂直比例尺
	var yScale = d3.scaleLinear()
		.domain([0,maxpo]) // 得到所有类别信息
		.rangeRound([height - marginleft1.bottom, marginleft1.top]) ;//[30-450] set the output range
		//.paddingInner(0.3); //设置柱状体间隔
	var ytag =d3.scaleLinear()
			.domain([0,maxpo/100])
			.rangeRound([height - marginleft1.bottom, marginleft1.top]) ;
			
	//绘制地图颜色
	var k = 9;
	var color = d3.scaleQuantize()
			.domain([-maxpo,0])
			.range(  d3.schemeSpectral[k] );
	var barsvg = d3.select("#left1").select("#barchart1")
	// 创建x轴和y轴
	 var xAxis = d3.axisBottom(xtag);
	 var yAxis = d3.axisLeft(yScale).tickFormat(d => d/100 + "B").ticks(5);
	 
	 // 更新缩放函数的范围
	   xScale.range([marginleft1.left, width - marginleft1.right]);
	   yScale.range([height - marginleft1.bottom, marginleft1.top]);
	 	
	 // 更新x轴和y轴的位置和刻度
	   barsvg.select("#bar1xAxis")
	     .attr("transform", `translate(0, ${height - marginleft1.bottom})`)
	     .call(xAxis);
	 
	   barsvg.select("#bar1yAxis")
	     .attr("transform", `translate(${marginleft1.left}, 0)`)
	     .call(yAxis);
	 // 更新柱状图的位置和大小
	 barsvg.select("#bar1rects").selectAll("rect")
		.data(barData)
		.join("rect")
		.transition()
		.duration(400)
		.ease(d3.easeLinear)
	   .attr("x", (d, i) => xScale(i))
	   .attr("y", d => yScale(d.population))
	   .attr("width", xScale.bandwidth())
	   .attr("height", d => height - marginleft1.bottom - yScale(d.population));
	// 更新标题位置
	 barsvg.select("#bar1Title")
	   .text(province+"参与人年龄段分布");
}