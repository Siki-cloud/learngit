//定义页面大小
var lineWidth = 1200;
var lineHeight = 480;
var linePadding = {
	top:30,
	right :50,
	bottom:90,
	left:50,
}
//拿到传入的读数据文件
//读取数据
var scriptArgs = new Object();
scriptArgs = getUrlParam('barchart'); //读取barchar.js的参数 用& 间隔多个参数
var read_data = scriptArgs['datafile'];
//定义全局数据
var lineData=[];
var lineBySate;  //柱状图上的条形，这边也会跟着画出所有洲的利润
var ALLlineData;
//var totalcolor;
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
	lineBySate = d3.groups(data,function(d){
		return d.state;
	});
	console.log(lineBySate);
	
	
	var statePPline=[];
	lineBySate.forEach(function(item,index,array){
		//console.log(item);
		
		statePPline.push({
			state : item[0],
			state_sale_profit : item[1]
		});
		var subc = item[0];
		var sales = 0;
		item[1].forEach(function(it,index){
		//	console.log(it)
			sales +=it["sales"];
		})
		lineData.push({state:subc, sales:sales});
	});
	lineBySate = d3.group(statePPline,d => d.state);
	
	console.log(lineBySate);
	console.log(lineData);
	
	ALLlineData=lineData; //存储all全局的 所有州的销量
	
	drawLine(); //根据barData绘制柱状图
	//updateLine('Chairs',3330,); //椅子各州的销量
	//updateBarChart("Texas")
});
function drawLine(){
	//设置svg 长宽
	var linesvg = d3.select("#Other")
		.attr("width", lineWidth)
		.attr("height", lineHeight)
		
		.attr('viewBox', [0, 0, lineWidth, lineHeight]);
	// var underlow = linesvg.append("g").append("rect")
	// .attr("width",lineWidth)
	// .attr("height",lineHeight)
	// .attr("fill","gray")
	// .attr("opacity","0.1")
	//根据 lineData 绘制曲线图
	var maxsales = d3.max(lineData,function(d,i){
		return +d.sales;
	});// nestBySubState is array
	var minsales = d3.min(lineData,function(d,i){
		return +d.sales;
	})
	
	// //曲线和点颜色
	// var k = 11;
	// totalcolor= d3.scaleDiverging()
	// 			.domain([0, maxsales])
	// 			.interpolator(d3.interpolateRdBu);
	// x轴的 的零点在上面
	var xScale =d3.scaleBand().domain(lineData.map(function(d){
			return d.state;
		}))
		.range([linePadding.left, lineWidth -linePadding.right]);
	
	// y 轴 0点再下方， 刻度从下往上增长	  
	var yScale = d3.scaleLinear()
	              .domain([0,maxsales])
	              .range([lineHeight - linePadding.bottom, linePadding.top ]);


	//添加x y轴坐
	//x 轴 和文字
	var xAxis = d3.axisBottom(xScale);
	d3.select("#linexAxis")
			.attr("transform","translate("+0+","+(lineHeight - linePadding.bottom) +")")
			.call(xAxis)
			.selectAll("text")
			            .style("font-size", "12px")
			            .style("text-anchor", "end")
			            .attr("transform", "rotate(-45 -12 12)");
		
			
	//y 轴 和文字
	var yAxis=d3.axisLeft(yScale);
	d3.select("#lineyAxis")
		.call(yAxis)
		.attr('transform',"translate("+linePadding.left+","+0+")");
		
	d3.select("#lineytag")
		.append("text")
		.text("sales/$")
		.attr("font-family", "sans-serif")
		.attr("font-size", "13px")
		.attr("fill", "blue")
		.attr("transform","translate("+(linePadding.left-45)  +","+(linePadding.top -2)+")");
	
	
	//生成曲线曲线位置相关
	var linepath = d3.line()
					.x(function(d,i){
						return xScale(d.state);
					})
					.y(d => yScale(d.sales))
	//曲线位置		
	var offset = (xScale(lineData[1].state)-xScale(lineData[0].state))/2
	console.log(offset)
	linesvg.select("#lines")
	 .append('path')
	 .datum(lineData)
	 .attr("transform","translate("+offset+","+0 +")")
	 .attr("d",linepath)
	 .attr("fill",'none')
	 .attr("stroke-width","3")
	 .attr("stroke","green")
	 .attr("opacity","0.5");
	
	// 源点的大小
	var csize = d3.scaleLinear().domain([minsales,maxsales]).rangeRound([5,15]);
	linesvg.select("#lines")
	 .append("g")
	 .attr("id","circle")
	 .selectAll("circle")
	 .data(lineData)
	 .enter()
	 .append("circle")
	 .attr("r",function(d){
		 return csize(d.sales);
	 })
	 .attr("fill",'green')
	 .attr("opacity","0.45")
	 .on("mouseover",function(envent,d){
		 console.log(("line,ENter over!!"))
		 d3.select(this)
		 .attr("fill","red")
		 .append("title")
		 .text(function(d){
			 
		 		 var str = 'state:'+ d.state + '\nsale:'+ d3.format(".1f")(d.sales)+'$';
				 return str;
		 })
	 })
	 .on("mouseout",function(event,d){
		 d3.select(this)
		 .attr("fill","green");
	 })
	
	 .attr("transform",(d) => {
	 		return 'translate('+(xScale(d.state)+offset)+','+yScale(d.sales)+')'; 
	 });
	 //.attr("transform","translate("+offset+","+0 +")")
	  
	 linesvg.append('g')
	     .attr('id', 'grid')
	     .attr('transform', 'translate(' + (0) + ',' + (lineHeight - linePadding.bottom) + ')')
		.call(xAxis.ticks(lineData.length).tickSize(-lineHeight + linePadding.top + linePadding.bottom).tickFormat(() => null))
		.attr("color","grey");
	
	//linesvg.
	

}

function updateLine(subCategory,sales, totalcolor){
	if(subCategory=="all"){
		d3.select("#lineTitle").text("Line: sales of all categories");
		 lineData=ALLlineData;
		 
		 updateLineByNewData(-1,totalcolor)
	}else{
		d3.select("#lineTitle").text("Line: sales of " + subCategory);
		//获取对应subcategory 的利润
		//nestBySubCategory 应该获得每个州上对应类别的利润值。
		//lineData set 0
		// lineData.forEach(function(item,index){
		// 	item['sales']=0;
		// })
		
		var tempinfo = [];
		lineBySate.forEach(function(item,index){
			//console.log(item)
			
			var salesinfo = d3.group(item[0]['state_sale_profit'],d => d.subCategory).get(subCategory)
			
			//console.log(salesinfo)
			if (salesinfo!= null){
				var arr=salesinfo[0]['sales'];
				//console.log(arr)
				tempinfo.push({
					state:item[0]['state'],
					sales :arr,
				})
			}
			else{
				tempinfo.push({
					state:item[0]['state'],
					sales :0,
				})
			}
		})
		lineData = tempinfo;
		console.log(lineData);
		updateLineByNewData(sales, totalcolor);
	}
}
function updateLineByNewData(sales,totalcolor){
	console.log(lineData)
	//根据 lineData 绘制曲线图
	var maxsales = d3.max(lineData,function(d,i){
		return +d.sales;
	});// nestBySubState is array
	var minsales = d3.min(lineData,function(d,i){
		return +d.sales;
	})
	console.log(maxsales);
	// x轴的 的零点在上面
	var xScale =d3.scaleBand().domain(lineData.map(function(d){
			return d.state;
		}))
		.range([linePadding.left, lineWidth -linePadding.right]);
	
	// y 轴 0点再下方， 刻度从下往上增长	  
	var yScale = d3.scaleLinear()
	              .domain([0,maxsales])
	              .range([lineHeight - linePadding.bottom, linePadding.top ]);
	
	
	
	var linesvg = d3.select("#Other")
	//更新曲线曲线位置相关
	var linepath = d3.line()
					.x(function(d,i){
						return xScale(d.state);
					})
					.y(d => yScale(d.sales))
	const transition = d3
	      .transition()
	      .duration(400)
	      .ease(d3.easeLinear);
	//曲线位置		
	var offset = (xScale(lineData[1].state)-xScale(lineData[0].state))/2
	console.log(offset)
	
  
	
	var curcolor = totalcolor(sales);
	if (sales == -1)
		curcolor='green';
	linesvg.select("#lines").selectAll('path')
	 .datum(lineData)
	 .attr("transform","translate("+offset+","+0 +")")
	 .attr("d",linepath)
	 .attr("fill",'none')
	 .attr("stroke-width","3")
	 .attr("stroke",curcolor)
	 .attr("opacity","0.5")
	 .transition(transition);
	 
	 //更新 点
	 // 源点的大小
	 var csize = d3.scaleLinear().domain([minsales,maxsales]).rangeRound([5,15]);
	  
	 var circles = linesvg.select("#lines")
	   .select("#circle")
	   .selectAll("circle")
	   .data(lineData)
	 
	  var updatecircle =circles 
	 var exitcircle= circles.exit()
	 exitcircle.remove()
	 
	   updatecircle.attr("r",function(d){
	  	 return csize(d.sales);
	   })
	   .attr("fill",curcolor)
	   .attr("opacity","0.45")
	   .on("mouseout",function(event,d){
		   console.log('line,oooooout!!')
		   d3.select(this).attr("fill",curcolor)
	   })
	   .attr("transform",(d) => {
	   		return 'translate('+(xScale(d.state)+offset)+','+yScale(d.sales)+')'; 
	   })
	  // .transition(transition);
	   
	   //更新y
	   //y 轴 和文字
	   var yAxis=d3.axisLeft(yScale);
	   d3.select("#lineyAxis")
	   	.call(yAxis)
	   	.attr('transform',"translate("+linePadding.left+","+0+")");
}