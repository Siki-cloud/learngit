// 定义边距
var marginright2 = { top: 30, right: 20, bottom: 100, left: 40 };
var key={};
		key["-1"]="普通用户"
		key["0"]="名人"
		key["10"]="机构"
		key["2"]="企业"
		key["200"]="初级达人"
		key["220"]="初级达人"
//拿参数
var scriptArgs = new Object();
scriptArgs = getUrlParam('map'); //读取barchar.js的参数 用& 间隔多个参数
var read_data_value= scriptArgs['datatarget']

console.log(read_data_value);
//绘制 验证类型 图
var nestByVf ;  //all
var lineData=[];  //year []
var lineNestByVf; //year
var ALLlineData;
var ALLpieNestByVf;
d3.csv(read_data_value).then(data => {
	
	nestByVf = d3.groups(data,function(d){
			return d.verified_type;
	})
	console.log(nestByVf)
	lineData=[]
	nestByVf.forEach(function(item, index){
		if(item[0]!=''){
			lineData.push({
				vf: item[0],
				po: +(item[1].length)
			})
		}
			
	})
	lineNestByVf = d3.group(pieData,d => d.xinzuo);
	console.log(lineNestByVf)
	console.log(lineData)
	drawLineChart();
})
function drawLineChart(){
	 // 获取窗口的宽度和高度
	    var container = d3.select('#right2');
	    var width = container.node().clientWidth;
	    var height = container.node().clientHeight;
		var plotWidth = width - marginright2.left - marginright2.right;
		var plotHeight = height - marginright2.top - marginright2.bottom;
		// 创建 SVG 容器
		var linesvg = container.append('svg')
		  .attr('width', '100%')
		  .attr('height', '100%')
		  .attr('viewBox', `0 0 ${width} ${height}`)
		  .attr('preserveAspectRatio', 'xMidYMid meet');
		// 创建比例尺，将数据映射到绘图区域
		
		console.log(key)
		var xScale = d3.scaleBand()
		      .domain(lineData.map(d => d.vf))
		      .range([0, plotWidth])
		      .padding(0.1);
		
		var yScale = d3.scaleLinear()
		      .domain([0, d3.max(lineData, d => +d.po)])
		      .range([plotHeight, 0]);
		
		// 创建折线生成器
		var line = d3.line()
		    .x(d => xScale(d.vf) + xScale.bandwidth() / 2)
		  .y(d => yScale(d.po))
		  .curve(d3.curveMonotoneX); // 使用曲线插值器连接离散点
		// 创建绘图区域
		var lineplot = linesvg.append('g').attr("id","lineplotright2")
		  .attr('transform', `translate(${marginright2.left}, ${marginright2.top})`);
		var VFcolor=  d3.scaleOrdinal()
				.domain([0, lineData.length])
				.range(d3.schemeSet1 );
		// 绘制折线路径
		lineplot.append('path')
		   .attr("id","lineright2")
		  .datum(lineData)
		  .attr('d', line)
		  .attr("stroke","grey")
		  .attr("stroke-width",3)
		  .attr("fill",'#0d0d0d')
		  .attr("opacity","0.85"); // 设置散点的颜色
		  
		// 绘制数据点
		lineplot.selectAll('.point')
		  .data(lineData)
		  .join('circle')
		  .attr('id', 'point')
		  .attr('cx', d => xScale(d.vf) + xScale.bandwidth() / 2)
		  .attr('cy', d => yScale(d.po))
		  .attr("stroke","white")
		  .attr("stroke-width",0.5)
		  .attr("fill", (d,i)=>VFcolor(i))
		  .attr("opacity","0.5") // 设置散点的颜色
		  .attr('r', 5)
		  .on("mouseover",function(){
			  d3.select(this).attr("stroke","red").attr("fill","bule")
		  })
		  .on("mouseout",function(event,d){
			  d3.select(this).attr("stroke","white").attr("fill",VFcolor(lineData.indexOf(d)));
		  })
		  .on("click",function(event,d){
			  console.log(d.vf)
			  updataMaobyVf(d.vf);
		  })
		  .append("title")
		  .attr("id","pointtitle")
		  .text((d,i)=>{
			  return d.vf+":"+d.po;
		  });
		
		
		
		// 创建 x 和 y 坐标轴
	   var xAxis = d3.axisBottom(xScale).tickFormat(d=>{return key[d]});
	    var yAxis = d3.axisLeft(yScale);
	   // 绘制 x 坐标轴
	   lineplot.append('g')
	     .attr('id', 'linex-axis')
	     .attr('transform', `translate(0, ${plotHeight})`)
		 .style("color", "white")
		 .style("opacity", "0.5")
	     .call(xAxis);
	  lineplot.append("text")
			.attr("id","line-xlabel")
			.attr("x", (plotWidth ) / 2 + marginright2.left/2)
			.attr("y", plotHeight +marginright2.bottom/3)
			.attr("text-anchor", "middle")
			.attr("fill","white")
			.attr("font-size","0.8vw")
			.attr("opacity","0.6")
			.text("认证原因 ");
	  
	  
	   // 绘制 y 坐标轴
	   lineplot.append('g')
	     .attr('id', 'liney-axis')
		 .style("color", "grey")
		 .style("opacity", "0.7")
	     .call(yAxis);	
		

		
		// 监听窗口大小变化事件，并重新绘制折线图
	   window.addEventListener('resize', () => {
	     // 更新窗口的宽度和高度
	     var newWidth = container.node().clientWidth;
	     var newHeight = container.node().clientHeight;
			
	     // 更新 SVG 容器的宽度和高度
	     linesvg.attr('width', newWidth)
	       .attr('height', newHeight)
	       .attr('viewBox', `0 0 ${newWidth} ${newHeight}`);
		// 更新绘图区域的宽度和高度
		    const newPlotWidth = newWidth -  marginright2.left -  marginright2.right;
		   const newPlotHeight = newHeight -  marginright2.top -  marginright2.bottom;
				  
	      // 更新比例尺的范围
	           xScale.range([0, newPlotWidth]);
	           yScale.range([newPlotHeight, 0]);
		// 更新折线生成器
		      line.x(d => xScale(d.vf) + xScale.bandwidth() / 2)
		        .y(d => yScale(d.po));
		// 更新绘图区域的位置
		lineplot.attr('transform', `translate(${ marginright2.left}, ${ marginright2.top})`);
	
		// 更新折线路径
		lineplot.select('path')
			.attr('d', line);    
	
		// 更新 x 和 y 坐标轴
	     xAxis.scale(xScale);
	     yAxis.scale(yScale);
	    
	    // 更新 x 坐标轴
	    lineplot.select('#linex-axis')
	     .attr('transform', `translate(0, ${newPlotHeight})`)
	    .call(xAxis);
		//x标签
	    lineplot.select("#line-xlabel")
	    			.attr("x", (newPlotWidth ) / 2 + marginright2.left/2)
	    			.attr("y", newPlotHeight +marginright2.bottom/3)
	 // 更新 y 坐标轴
		lineplot.select('#liney-axis')
	      .call(yAxis);
	    // 绘制数据点
	    lineplot.selectAll('#point')
	      .attr('cx', d => xScale(d.vf) + xScale.bandwidth() / 2)
	      .attr('cy', d => yScale(d.po));
	 });
}
function updateright2(province,pitcolor){
	lineData=[]
	if (province=='all'){
		nestByVf.forEach(function(item, index){
			if(item[0]!=''){
				lineData.push({
					vf: item[0],
					po: +(item[1].length)
				})
			}
				
		})
	}
	else{
		nestByVf.forEach(function(item, index){
			if(item[0]!=''){
				var temp = item[1].filter(function(d){
					return d['location']==province;
				})
				
				lineData.push({
					vf: item[0],
					po: +(temp.length)
				})
			}
				
		})
	}
	lineNestByVf = d3.group(pieData,d => d.xinzuo);
	console.log(lineNestByVf);
	console.log(lineData);
	console.log("!!!!!!!!!!::",pitcolor);
	updateLineInstance(pitcolor);
}
function updateLineInstance(pitcolor="grey"){
	// 获取窗口的宽度和高度
	   var container = d3.select('#right2');
	   var width = container.node().clientWidth;
	   var height = container.node().clientHeight;
		var plotWidth = width - marginright2.left - marginright2.right;
		var plotHeight = height - marginright2.top - marginright2.bottom;
	
	//比例尺
	var xScale = d3.scaleBand()
	      .domain(lineData.map(d => d.vf))
	      .range([0, plotWidth])
	      .padding(0.1);
	
	var yScale = d3.scaleLinear()
	      .domain([0, d3.max(lineData, d => +d.po)])
	      .range([plotHeight, 0]);
	
	var VFcolor=  d3.scaleOrdinal()
			.domain([0, lineData.length])
			.range(d3.schemeSet1 );
	// 创建折线生成器
	var line = d3.line()
	    .x(d => xScale(d.vf) + xScale.bandwidth() / 2)
	  .y(d => yScale(d.po))
	  .curve(d3.curveMonotoneX); // 使用曲线插值器连接离散点
	// 创建绘图区域
	var lineplot = container.select("#lineplotright2")
     console.log("!!!!!!!!!!!!!",pitcolor)
	// 绘制折线路径
	lineplot.select("#lineright2")
	  .datum(lineData)
	  .transition()
	  .duration(400)
	  .ease(d3.easeLinear)
	  .attr('d', line)
	  .attr("stroke",pitcolor)
	  .attr("stroke-width",3)
	  .attr("opacity","0.5"); // 设置散点的颜色
	  
	// 绘制数据点
	var temppoint = lineplot.selectAll('#point')
	  .data(lineData)
	  .join('circle')
	temppoint.on("mouseover",function(){
		  d3.select(this).attr("stroke","red").attr("fill","bule")
	  })
	  .on("mouseout",function(event,d){
		  d3.select(this).attr("stroke","white").attr("fill",VFcolor(lineData.indexOf(d)));
	  })
	  .on("click",function(event,d){
		  console.log(d.vf)
		  updataMaobyVf(d.vf);
	  })
	  .select("#pointtitle")
	  .text((d,i)=>{
		  return d.vf+":"+d.po;
	  });
	temppoint.transition()
	  .duration(400)
	  .ease(d3.easeLinear)
	  .attr('cx', d => xScale(d.vf) + xScale.bandwidth() / 2)
	  .attr('cy', d => yScale(d.po))
	  .attr("stroke","white")
	  .attr("stroke-width",0.5)
	  .attr("fill", (d,i)=>VFcolor(i))
	  .attr("opacity","0.5") // 设置散点的颜色
	  .attr('r', 5)
	
	
	// 创建 x 和 y 坐标轴
	var xAxis = d3.axisBottom(xScale).tickFormat(d=>{return key[d]});
	var yAxis = d3.axisLeft(yScale);
	// 更新 x 和 y 坐标轴
	    xAxis.scale(xScale);
	    yAxis.scale(yScale);
	   
	// 更新 x 坐标轴
	lineplot.select('#linex-axis')
	    .attr('transform', `translate(0, ${plotHeight})`)
	   .call(xAxis);
	//x标签
	lineplot.select("#line-xlabel")
	   			.attr("x", (plotWidth ) / 2 + marginright2.left/2)
	   			.attr("y", plotHeight +marginright2.bottom/3)
	// 更新 y 坐标轴
	lineplot.select('#liney-axis')
	     .call(yAxis);
	   // 绘制数据点
	   lineplot.selectAll('#point')
	     .attr('cx', d => xScale(d.vf) + xScale.bandwidth() / 2)
	     .attr('cy', d => yScale(d.po));
}