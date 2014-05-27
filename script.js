// TODO
// 1. 修改 getAllProv 方法，自动获取未处理的省份是哪些
// 2. 或者记录上次处理到哪儿了

var SCHOOL = 'SCHOOL';
var store_string = localStorage.getItem(SCHOOL) || '[]';
var store = JSON.parse(store_string);

function clearStore(){
  localStorage.clear();
}

function saveStore(rows){
  if(!hasRowsSaved(rows)){
    store = store.concat(rows);
    var data = JSON.stringify(store);
    localStorage.setItem(SCHOOL,data);
  }else{
    console.log('该页已经保存过');
  }
}

function hasRowsSaved(rows){
  var name = rows[0].name;
  var flag = false;
  $.each(store,function(i,row){
    if(row.name === name){
      flag = true;
      return false;
    }
    return true;
  });
  return flag;
}

/** http://stackoverflow.com/questions/647259/javascript-query-string
 * @param qry the querystring
 * @param name name of parameter
 * @returns the parameter specified by name
 * @author eduardo.medeirospereira@gmail.com
 */
function getQueryStringParameter(qry,name){
  if(typeof qry !== undefined && qry !== ""){
    var keyValueArray = qry.split("&");
    for ( var i = 0; i < keyValueArray.length; i++) {
      if(keyValueArray[i].indexOf(name)>-1){
        return keyValueArray[i].split("=")[1];
      }
    }
  }
  return "";
}

function serialize(o){
  var s = '';
  for(var x in o){
    s+=x+'='+o[x]+'&';
  }
  return s && s.slice(0,-1);
}

function composeParam(opt){
  var ret = {
    "cengci":"高中_cengci"
  };
  if(opt.prov){
    ret.local1 = opt.prov+'_local1';
  }
  if(opt.city){
    ret.local2 = opt.city+'_local2';
  }
  if(opt.page){
    ret.page=opt.page;
  }
  return ret;
}

function getAllProv(){
  return ["北京", "上海", "天津", "四川", "安徽", "江苏", "浙江", "辽宁", "山西", "福建", "广东", "广西", "海南", "河南", "湖南", "陕西", "湖北", "江西", "河北", "山东", "重庆", "青海", "吉林", "云南", "贵州", "甘肃", "宁夏", "新疆", "西藏", "内蒙古", "黑龙江"];
}

function getCurrentProv(){
  var ret;
  var href = location.href;
  var prov = getQueryStringParameter(href,"local1");
  if(!prov){
    var provs = getAllProv();
    if(provs){
      ret = prov[0];
    }else{
      console.log('获取省份失败');
      ret = false;
    }
  }else{
    ret = prov.replace('_local1','');
    ret = decodeURI(ret);
  }
  if(ret && !isSetCityOfProv(ret)){
    setCurrentCitiesOfProv(ret);
  }
  return ret;
}
function getCurrentPage(){
  var href = location.href;
  var page = getQueryStringParameter(href,"page");
  page = parseInt(page);
  return page || 1;
}
function getTotalPage(){
  var text = $(".page").text().trim();
  var arr = text.match(/共(\d+)页/);
  return (arr && arr[1]) || 1;
}

function isSetCityOfProv(prov){
  return (provinceMap.cities && provinceMap.cities.length !== 0);
}
function setCurrentCitiesOfProv(prov){
  provinceMap[prov] || (provinceMap[prov]={});
  //provinceMap[prov].cities = $.map($(".quyu_list a"),function(a){return $(a).text()});
  provinceMap[prov].cities = $.map($(".quyu_list a"),function(a){
                               var query = a.getAttribute('href');
                               var val = getQueryStringParameter(query,"local2");
                               return decodeURI(val.replace('_local2',''));
                             });
}

function getAllCityOfProv(prov){
  return provinceMap[prov] && provinceMap[prov].cities;
}

var provinceMap = {};

function getCurrentCityOfProv(prov){
  var ret;
  var href = location.href;
  var city = getQueryStringParameter(href,"local2");
  if(!city){
    var cities = getAllCityOfProv(prov);
    if(cities){
      ret = cities[0];
    }else{
      console.log('获取城市失败');
      ret = false;
    }
  }else{
    ret = city.replace('_local2','');
    ret = decodeURI(ret);
  }
  return ret;
}

function savePageData(){
  var prov = getCurrentProv();
  var city = getCurrentCityOfProv(prov);
  var schools = $('.right_box');
  var rows = [];
  $.map(schools,function(school){
    var name = $('h2',school).text().trim();
    var detail = $('h3',school).text().trim();
    var parts = detail.split(/\s+/);

    var row = {};
    row.name = name;
    // row.prov = decodeURI(prov);
    row.city = city;

    $.each(parts,function(i,item){
      var o = {
          "地址":"address",
          "邮编":"mailno",
          "电话":"phone"
      };
      var ab = item.split('：');
      var key = o[ab[0]];
      row[key] = ab[1];
    });
    rows.push(row);
  })
  saveStore(rows);
}

function handleNextProv(){
  var provs = getAllProv();
  var prov = getCurrentProv();
  // prov = decodeURI(prov);
  var i = provs.indexOf(prov)
  var nextprov;
  if(i>-1){
    nextprov = provs[i+1];
    if(nextprov){
      var param = composeParam({
        prov:nextprov,
        page:1
      });
      // 访问下个省份
      console.log('访问下个省份');
      var href = serialize(param);
      href = '/?'+href;
      location.href = href;
    }else{
      console.log('完毕');
    }
  }else{
    console.log('完毕');
  }
}

function handleNextCity(){
  var prov = getCurrentProv();
  if(prov){
    var cities = getAllCityOfProv(prov);
    var city = getCurrentCityOfProv(prov);
    var i = cities.indexOf(city)
    var nextcity;
    if(i>-1){
      nextcity = cities[i+1];
      if(nextcity){
        var param = composeParam({
          prov:prov,
          city:nextcity,
          page:1
        });
        // 访问下个城市
        var href = '/?'+serialize(param);
        console.log('访问下个城市');
        console.log(href);
        location.href=href;
      }else{
        // 访问下个省份
        console.log('访问下个省份');
        handleNextProv();
      }
    }else{
      // 访问下个省份
      console.log('访问下个省份');
      handleNextProv();
    }
  }else{
    console.log('不能获取当前省份');
  }
}

function handleCurrentCityOfPage(){
  var prov = getCurrentProv();
  var city = getCurrentCityOfProv(prov);
  if(city){
    savePageData();
    var page = getCurrentPage();
    var totalPage = getTotalPage();
    if(page<totalPage){
      handleCurrentCityOfNextPage();
    }else{
      handleNextCity();
    }
    function handleCurrentCityOfNextPage(){
      var param = composeParam({
        prov:prov,
        city:city,
        page:page+1
      });
      var href = '/?'+serialize(param);
      // var href = //href.replace(/page=\d+/,"page="+(page+1));
      setTimeout(function(){
        location.href = href;
      },1000);
    }
  }else{
    console.log('不能获取当前城市');
  }
}

handleCurrentCityOfPage();

// 获取当前省份、某个市、高中下的数据
// 计算某个市总共多少页
// 获取下页
// 若没有下页了
// 获取下一个市的
// 若没有下个市了，获取下个省份的
