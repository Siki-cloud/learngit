
//拿参数
var scriptArgs = new Object();
scriptArgs = getUrlParam('map'); //读取barchar.js的参数 用& 间隔多个参数
var read_data_map = scriptArgs['datamap'];
var read_data_value= scriptArgs['datatarget']

console.log(read_data_map);
console.log(read_data_value );

var mapInfo;
var nestByProvince;
var originByProvince;
var infoMap=[]
var ALLnestByProvince;
var ALLinfoMap=[];
var men =0;
var women =0;
var total =0 ;
d3.json(read_data_map).then(ca =>{
	d3.csv(read_data_value).then(dataCA => {
		//all
		//按照用户地理位置分类
		originByProvince  = d3.groups(dataCA,function(d){
			if (d.location!= null) {
				return d.location;
			}
			
		})
		//console.log(originByProvince);
		
		//统计每个省的人数
		var subCategoryPP=[]
		originByProvince .forEach(function(item,index,array){
			//console.log(item)
			subCategoryPP.push({
				province: item[0],
				population : +(item[1]).length
			});
			total += +(item[1].length)
			item[1].forEach(function(item,index){
				if (item['gender']=='m')
					men +=1
				else
					women +=1
			})
		})
		//console.log(subCategoryPP);
		//console.log('total:',total,"men:",men,"women:",women);
		
		nestByProvince = d3.group(subCategoryPP, d=>d.province);
		//console.log(nestByProvince)
		infoMap = subCategoryPP
		mapInfo = ca;

		ALLnestByProvince =nestByProvince
		ALLinfoMap = infoMap
		
		
		drawMap(ca);
	})
});

function drawMap(ca){
	//设置cener1
	d3.select("#v1").text(total)
	d3.select("#v2").text("全国")
	d3.select("#v3").text(men)
	d3.select("#v4").text(women)
	
	var maxpo = d3.max(infoMap, function(d,i){
		return +d.population;
	});
	var minpo = d3.min(infoMap, function(d,i){
		return +d.population;
	});
	console.log(minpo,maxpo)
	var clientRects = d3.select("#center2").node().getBoundingClientRect();
	//console.log(clientRects.width,clientRects.height)
	var mapsvg = d3.select("#center2").append("svg")
				.attr("id","Map")
				.attr("width","100%")
				.attr("height","100%")
				.attr("preserveAspectRatio","xMidYMid meet")
				//.attr("viewBox","0 0 10 10");
				.attr("viewBox","0 0 "+clientRects.width/1.001+" "+clientRects.height/1.001);
	var underlow = mapsvg.append("g").append("rect")
						.attr("width","100%")
						.attr("height","100%")
						.attr("fill","dark")
						.attr("opacity","0.1")
						.on("click",function(){
							console.log("underlow ccc");
							updateMap("all");
							updataleft1("全国");
							updateleft2("all");
							updateright1("all");
							updateright2("all");
						})
	//绘制地图颜色
	var k = 9;
	var color = d3.scaleQuantize()
			.domain([-maxpo,-minpo])
			.range(  d3.schemeSpectral[k] );
	var format = d3.format(".1f");
	//设置投影
	
	var projection = d3.geoMercator().fitSize([clientRects.width,clientRects.height],ca)
	
	const path = d3.geoPath().projection(projection);
	mapsvg.append("g")
			.attr("class", "regions")
			.selectAll('path')
	        .data(ca.features )
			//.data(topojson.feature(ca.features).features)
	        .join('path')
	        .attr('d', path)
	        .attr('fill', function (d, i) {
				//console.log(d);
				var province =d['properties']['name']
				//console.log(province)
				var obj = nestByProvince.get(province)
				//console.log(obj)
				if (obj==null)
					return "grey";
				
	            return color(-obj[0].population);
				
	        })
			.attr("filter","drop-shadow(1px 1px 5px rgba(179, 171, 130, 0.5))")
	        .attr('stroke', 'rgba(255, 255, 255, 1.0)')
	        .attr('stroke-width', 0.51)
			.on('mouseover',function(d,i){
				console.log('mouseover')
				d3.select(this)
				   .attr("fill","yellow");
			})
			.on('mouseout',function(d,i){
				
				d3.select(this).attr("fill",function(d){
					//var province =d['target']['__data__']['properties']['name']
					var province =d['properties']['name']
					//console.log(province)
					var obj = nestByProvince.get(province)
					//console.log(obj)
					if (obj==null)
						return "grey";
					return color(-obj[0].population);
				})
				   .attr("stroke","white").attr("stroke-width",0.51);
			})
			.on('click',function(event,d){
				var province =d['properties']['name']
				d3.select(this)
				   .attr("stroke","red")
				   .attr("stroke-width",1);
				var obj = nestByProvince.get(province)
				var colottr ="grey"
				if (obj!=null) 
					colottr =color(-obj[0].population)
				console.log('mapclick:',colottr);
				d3.select("#v2").text(province);
				updataIndexForMap(province);
				updataleft1(province);
				updateleft2(province);
				updateright1(province);
				updateright2(province,colottr);
			})
			.append("title")
			.text(function(d){
				
				var province =d['properties']['name']
				//console.log(province)
				var obj = nestByProvince.get(province)
				var population=0
				if (obj!=null){
					population = obj[0].population; 
				}
				return province +'\nPoster:'+population;
			});
			//绘制比例尺
			// 定义图例大小
			var legendWidth = 20; // 使用vw单位
			var legendHeight =10; // 使用vh单位
			var iternal = (maxpo -minpo)/(k)
			let range = (start,end,step)=>[...function*(){while(start<end)yield start,start+=step}()]
			
			var legendAxisTicks = range(minpo,maxpo+10,iternal)
			//console.log(legendAxisTicks)
			var legend =mapsvg.append('g')
						.attr("id","maplegend")
						.attr('width',legendWidth+"vw")
						.attr('height',legendHeight+'vh')
						.attr("preserveAspectRatio","xMidYMid meet")
						.attr("viewBox","0 0 100 100");
		
			legend.selectAll("rect")
					.data(color.range())
					.join('rect')
						.attr("x",5)
						.attr("y",function(d,i){
							return (10+i*3)+'%';
						})
						.attr("width",legendWidth)
						.attr("height",legendHeight)
						.attr("fill",d=>d)
						.attr("opacity","0.7")
						.on("mouseover",function(d,i){
							d3.select(this).attr("fill","white");
							
						})
						.on("mouseout",function(d,i){
							d3.select(this).attr("fill",d=>d);
						})
						.on("click",function(event,d){
							
							var j = color.range().indexOf(d)
							//console.log(j)
							var min=legendAxisTicks[k-j-1];
							var max = legendAxisTicks[k-j];
							
							console.log(min,max)
							mapsvg.select(".regions").selectAll("path")
								.attr("stroke",function(d){
									var obj = nestByProvince.get(d.properties.name);
									//console.log(d.properties.name, obj)
									if (obj!=null){
										if (obj[0].population < max  && obj[0].population >=min)
											return "red";
										else
											return "black";
									}
								})
								.attr("fill",function(d){
									var obj = nestByProvince.get(d.properties.name);
									if (obj!=null){
										var s=obj[0].population
										console.log(obj[0])
										if ( s< max  && s >=min)
											return "rgb(0, 69, 41)";
										else
											return "grey";
									}
								})
								
						})
						.append("title")
						.text(function(d,i){
							//console.log(i)
							//console.log(legendAxisTicks[k-i],legendAxisTicks[k-i-1])
							return Math.ceil(legendAxisTicks[k-i-1])+' - '+Math.ceil(legendAxisTicks[k-i]);
							
						});
			
}
function updateMap(str){
	//更新 nestByProvince， 和 infoMap
	total =0
	men =0
	women =0
	if (str=="all"){
		nestByProvince = ALLnestByProvince;
		infoMap = ALLinfoMap;
		originByProvince .forEach(function(item,index,array){
			total += +(item[1].length)
			item[1].forEach(function(item,index){
				if (item['gender']=='m')
					men +=1
				else
					women +=1
			})
		})
		//其他三个在里面更新
		d3.select("#v2").text("全国")
		updataMapInstance();
	}

}
function updataIndexForMap(province){
	originByProvince .forEach(function(item,index,array){
		var temp =item[1].filter(function(d){
			return d['location']==province;
		})
		total += +(temp.length)
		temp.forEach(function(item,index){
			if (item['gender']=='m')
				men +=1
			else
				women +=1
		})
	})
	//设置cener1
	d3.select("#v1").text(total)
	d3.select("#v2").text(province)
	d3.select("#v3").text(men)
	d3.select("#v4").text(women)
}
function  updataMaobyVf(vf){
	//筛选出指定认证原因分布
	d3.select("#v2").text('全国'+key[vf]);
	infoMap=[]
	men=0
	women=0
	total=0
	originByProvince.forEach((item,index)=>{
		const temp = item[1].filter(function(d){
			return d.verified_type == vf;
		})
		infoMap.push(
		{
			province: item[0],
			population : +(temp).length
		})
		temp.forEach((item,i)=>{
			if (item['gender']=='m')
				men+=1
			else
				women+=1
			total+=1
		})
	})
	nestByProvince = d3.group(infoMap, d=>d.province);
	console.log("updataMapby mbrank:",infoMap,women,men,total);
	updataMapInstance();
}
function updataMapByMbrank(mbrank){
	//筛选出指定等级全国人口分布
	d3.select("#v2").text("会员"+mbrank+'级');
	infoMap=[]
	men=0
	women=0
	total=0
	originByProvince.forEach((item,index)=>{
		const temp = item[1].filter(function(d){
			return d.mbrank == mbrank;
		})
		infoMap.push(
		{
			province: item[0],
			population : +(temp).length
		})
		temp.forEach((item,i)=>{
			if (item['gender']=='m')
				men+=1
			else
				women+=1
			total+=1
		})
	})
	nestByProvince = d3.group(infoMap, d=>d.province);
	console.log("updataMapby mbrank:",infoMap,women,men,total);
	updataMapInstance();
}
function updateMapByYear(year){
	//筛选出指定星座的全国人口分布
	d3.select("#v2").text("全国"+year+'后');
	infoMap=[]
	men=0
	women=0
	total=0
	originByProvince.forEach((item,index)=>{
		const temp = item[1].filter(function(d){
			return d.year == year;
		})
		infoMap.push(
		{
			province: item[0],
			population : +(temp).length
		})
		temp.forEach((item,i)=>{
			if (item['gender']=='m')
				men+=1
			else
				women+=1
			total+=1
		})
	})
	nestByProvince = d3.group(infoMap, d=>d.province);
	console.log("updataMapby year:",infoMap,women,men,total);
	updataMapInstance();
}
function updateMapByxinzuo(xinzuo){
	d3.select("#v2").text("全国"+xinzuo);
	//筛选出指定星座的全国人口分布
	infoMap=[]
	men=0
	women=0
	total=0
	originByProvince.forEach((item,index)=>{
		const temp = item[1].filter(function(d){
			return d.xinzuo==xinzuo;
		})
		infoMap.push(
		{
			province: item[0],
			population : +(temp).length
		})
		temp.forEach((item,i)=>{
			if (item['gender']=='m')
				men+=1
			else
				women+=1
			total+=1
		})
	})
	nestByProvince = d3.group(infoMap, d=>d.province);
	console.log("updataMapby xinzuo:",infoMap,women,men,total);
	updataMapInstance();
}
function updataMapInstance(){
	//设置cener1
	d3.select("#v1").text(total)
	
	d3.select("#v3").text(men)
	d3.select("#v4").text(women)
	
	var maxpo = d3.max(infoMap, function(d,i){
		return +d.population;
	});
	var minpo = d3.min(infoMap, function(d,i){
		return +d.population;
	});
	console.log(minpo,maxpo)
	//绘制地图颜色
	var k = 9;
	var color = d3.scaleQuantize()
			.domain([-maxpo,-minpo])
			.range(  d3.schemeSpectral[k] );
	var mapsvg = d3.select("#center2").select("#Map");
	var teemp = mapsvg.select(".regions")
			.selectAll('path');
	teemp.on('mouseout',function(d,i){
				d3.select(this).attr("fill",function(d){
					//var province =d['target']['__data__']['properties']['name']
					var province =d['properties']['name']
					//console.log(province)
					var obj = nestByProvince.get(province)
					//console.log(obj)
					if (obj==null)
						return "grey";
					return color(-obj[0].population);
				})
				   .attr("stroke","white").attr("stroke-width",0.51);
			})
			.on('click',function(event,d){
				var province =d['properties']['name']
				d3.select(this)
				   .attr("stroke","red")
				   .attr("stroke-width",1);
				var obj = nestByProvince.get(province)
				var colottr ="grey"
				if (obj!=null) 
					colottr =color(-obj[0].population)
				console.log('mapclick:',colottr);
				d3.select("#v2").text(province);
				updataIndexForMap(province);
				updataleft1(province);
				updateleft2(province);
				updateright1(province);
				updateright2(province,colottr);
			});
	teemp.transition()
	        .duration(400)
	        .ease(d3.easeLinear)
	        .attr('fill', function (d, i) {
				console.log(d);
				var province =d['properties']['name']
				console.log(province)
				var obj = nestByProvince.get(province)
				console.log(obj)
				if (obj==null)
					return "grey";
				
	            return color(-obj[0].population);
				
	        })
	        .attr('stroke', 'rgba(255, 255, 255, 1')
	        .attr('stroke-width', 0.51)
			.select("title")
			.text(function(d){
				
				var province =d['properties']['name']
				console.log(province)
				var obj = nestByProvince.get(province)
				var population=0
				if (obj!=null){
					population = obj[0].population; 
				}
				return province +'\nPoster:'+population;
			});
		//调整
		var iternal = Math.ceil((maxpo -minpo)/(k))
		let range = (start,end,step)=>[...function*(){while(start<end)yield start,start+=step}()]
		
		var legendAxisTicks = range(minpo,maxpo+50,iternal)
		var legend = mapsvg.select("#maplegend").selectAll("rect")
						.on("click",function(event,d){
							
							var j = color.range().indexOf(d)
							//console.log(j)
							var min=legendAxisTicks[k-j-1];
							var max = legendAxisTicks[k-j];
							
							console.log(min,max)
							mapsvg.select(".regions").selectAll("path")
								.attr("stroke",function(d){
									var obj = nestByProvince.get(d.properties.name);
									//console.log(d.properties.name, obj)
									if (obj!=null){
										if (obj[0].population < max  && obj[0].population >=min)
											return "red";
										else
											return "black";
									}
								})
								.attr("fill",function(d){
									var obj = nestByProvince.get(d.properties.name);
									if (obj!=null){
										var s=obj[0].population
										console.log(obj[0])
										if ( s< max  && s >=min)
											return "rgb(0, 69, 41)";
										else
											return "grey";
									}
								})
								
						})
						.select("title")
						.text(function(d,i){
							console.log(i)
							console.log(legendAxisTicks[k-i],legendAxisTicks[k-i-1])
							return legendAxisTicks[k-i-1]+' - '+legendAxisTicks[k-i];
							
						});
}