// 定义图表的边距和大小
var marginleft2 = { top: 50, right: 30, bottom: 10, left: 30 };

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
	var minpo= d3.min(pieData,(d,i)=>{
		return +d.population;
	})
	// var colorScale =d3.scaleDiverging()//d3.scaleOrdinal()
	//   .domain([minpo,maxpo])
	//   .interpolator(d3.interpolateRdBu);
	// //  .range(  d3.interpolateCubehelixDefault(1) );
	var colorScale = d3.scaleOrdinal()
	  .domain([0,maxpo-minpo])
	  .range( d3.schemePaired );
	var radiusScale = d3.scaleLinear()
		.domain([Math.ceil(minpo/2),maxpo])
		.range([Math.min(width, height) /9,Math.min(width, height) / 2 - 10]);
	// 创建路径生成器
	var arc = d3.arc()
	  .innerRadius(Math.min(width, height) /10 )
	  .outerRadius(d=>radiusScale(d.data.population))
	  .cornerRadius(5)
	  .padAngle(0.02);
	
	
	// 创建饼图布局
	var pie = d3.pie()
	  .sort((a, b) => d3.ascending(a.population, b.population))
	  .value(d => d.population);
	// 生成饼图数据
	var piedata = pie(pieData);
	// 绘制饼图
	var arcs = piesvg.append("g")
	   .attr("id","piechartleft2")
	   .selectAll("path")
	  .data(piedata)
	  .join("path")
	  .attr("d", arc)
	  .attr("fill", (d, i) => colorScale(maxpo - d.value))
	   .attr("stroke","white")
	   .attr("stroke-width",0.5)
	  .attr("opacity",0.8)
	  .attr("filter","drop-shadow(0 2px 1px rgba(255, 255, 255, 0.5))")
	  
	  .on("mouseenter",function(event,d){
		  console.log("imouseover");
		  d3.select(this).attr("fill","white");
	  })
	  .on("mouseleave",function(event,d){
		  d3.select(this).attr("fill",function(d){
			  return colorScale(maxpo - d.value);
		  });
	  })
	  .on("click",function(event,d){
		  console.log(d.data.xinzuo+' TODO');
		  updateMapByxinzuo(d.data.xinzuo)
	  })
	  .attr("transform", `translate(${width / 2}, ${height / 2})`)
	  .append("title")
	  .attr("id","Piecharttitle")
	   .text((d, i) =>{
	  			//console.log(d.data.xinzuo)
	  			return  d.data.xinzuo+' :'+d.data.population;
	  	});
	  // 添加图例
	var legend = piesvg.append("g")
	    .attr("id", "pie2legend")
	    .attr("transform", `translate(${width - marginleft2.right}, ${marginleft2.top})`);
	// var legendItems = legend.selectAll(".legend-item")
	//   .data(piedata)
	//   .join("g")
	//   .attr("id", "pielegend-item")
	//   .attr("transform", (d, i) => `translate(0, ${i * 15})`);
	// legendItems.append("rect")
	var legendItems = legend.selectAll(".legend-item")
	  .data(piedata)
	  .join("rect")
	  .attr("id", "pielegend-item")
	  .attr("x", "10%")
	  .attr("y", 0)
	  .attr("width", "0.9vw")
	  .attr("height", "0.8vh")
	  .attr("fill", (d, i) => colorScale(maxpo - d.value))
	  .attr("opacity",0.7)
	  .on("mouseover",function(event,d){
		 
		  const xz = d.data.xinzuo
		  console.log(xz)
		  d3.select("#piechartleft2").selectAll("path")
		  .attr("fill",function(dr){
			  console.log(dr)
			  if (dr.data.xinzuo==xz)
					return "white";
		  })
	  })
	  .on("mouseout",function(event,d){
	  		 
	  		  const xz = d.data.xinzuo
	  		  console.log(xz)
	  		  d3.select("#piechartleft2").selectAll("path")
	  		  .attr("fill",function(dr){
	  			  return colorScale(maxpo - dr.data.population)
	  			 
	  		  })
	  })
	   .attr("transform", (d, i) => `translate(0, ${i * 15})`)
	  .append("title")
	  .attr("id","pielegendtitle")
	   .text((d, i) =>{
			//console.log(d.data.xinzuo)
			return d.data.xinzuo +' '+d.data.population+'人';
		} );
	
}
function updateleft2(province){
	pieData=[]
	if (province =="all"){
		
		nestByXinzuo.forEach(function(item, index){
			if(item[0]!='None' && item[0]!="2002-00-00"&&item[0]!="2017-00-24"){
				pieData.push({
					xinzuo:item[0],
					population: +(item[1].length)
				})
			}
				
		})
	}
	else{
		nestByXinzuo.forEach(function(item, index){
			if(item[0]!='None' && item[0]!="2002-00-00"&&item[0]!="2017-00-24"){
				var temp = item[1].filter(function(d){
					return d.location==province;
				})
				pieData.push({
					xinzuo:item[0],
					population: +(temp.length)
				})
			}
				
		})
	}
	pieNestByXinzuo = d3.group(pieData,d => d.xinzuo);
	console.log(province,pieData,pieNestByXinzuo);
	updataPie();
}
function updataPie(){
	var piesvg=d3.select("#left2");
	var pieRects = d3.select("#left2").select("#piechart2").node().getBoundingClientRect();
	var width = +pieRects.width - marginleft2.left - marginleft2.right;
	var height = +pieRects.height - marginleft2.top - marginleft2.bottom;
	// 创建颜色比例尺
	var maxpo= d3.max(pieData,(d,i)=>{
		return +d.population;
	})
	var minpo= d3.min(pieData,(d,i)=>{
		return +d.population;
	})
	//color radius
	var colorScale = d3.scaleOrdinal()
	  .domain([0,maxpo-minpo])
	  .range( d3.schemeSet3 );//d3.schemeSet3,d3.schemePaired
	var radiusScale = d3.scaleLinear()
		.domain([Math.ceil(minpo/2),maxpo])
		.range([Math.min(width, height) /9,Math.min(width, height) / 2 - 10]);
		
	// 创建路径生成器
	var arc = d3.arc()
	  .innerRadius(Math.min(width, height) /10 )
	  .outerRadius(d=>radiusScale(d.data.population))
	  .cornerRadius(5)
	  .padAngle(0.02);
	
	// 创建饼图布局
	var pie = d3.pie()
	  .sort((a, b) => d3.ascending(a.population, b.population))
	  .value(d => d.population);
	// 生成饼图数据
	var piedata = pie(pieData);
	
	var arcs = piesvg.select("#piechartleft2")
	   .selectAll("path")
	  .data(piedata)
	  .join("path");
	 
	
	  arcs.on("mouseleave",function(event,d){
	  		  d3.select(this).attr("fill",function(d){
	  			  return colorScale(maxpo - d.value);
	  		  });
	  })
	  .on("click",function(event,d){
	  		  console.log(d.data.xinzuo+' TODO');
	  		  updateMapByxinzuo(d.data.xinzuo)
	  })
	
	  .select("#Piecharttitle")
	  .text((d, i) =>{
	  	  			return  d.data.xinzuo+' :'+d.data.population;
	  	  	});
	arcs.transition()
	  .duration(400)
	  .ease(d3.easeLinear)
	  .attr("class","mainpie")
	  .attr("d", arc)
	  .attr("fill", (d, i) => colorScale(maxpo - d.value));
	var legend = piesvg.select("#pie2legend")
	var legendItems = legend.selectAll("#pielegend-item")
	  .data(piedata)
	  .attr("fill", (d, i) => colorScale(maxpo -d.value))
	  .attr("opacity",0.7)
	  .on("mouseover",function(event,d){
		 
		  const xz = d.data.xinzuo
		  console.log(xz)
		  d3.select("#piechartleft2").selectAll("path")
		  .attr("fill",function(dr){
			//  console.log(dr)
			  if (dr.data.xinzuo==xz)
					return "white";
		  })
	  })
	  .on("mouseout",function(event,d){
	  		 
	  		  const xz = d.data.xinzuo
	  		  console.log(xz)
	  		  d3.select("#piechartleft2").selectAll("path")
	  		  .attr("fill",function(dr){
				  console.log(maxpo- dr.data.population)
	  			  return colorScale(maxpo - dr.value)
	  			 
	  		  })
	  })
	  .transition()
	  .duration(10)
	  .ease(d3.easeLinear)
	  .select("#pielegendtitle")
	   .text((d, i) =>{
			//console.log(d.data.xinzuo)
			return d.data.xinzuo +' '+d.data.population+'人';
		} );
}