var dataJson = {};
var box = new twaver.ElementBox();
var network = new twaver.vector.Network(box);
var linkWidth = 13;
var docW, docH;
var mapW = 300, mapH = 200;
var focusSta, moveSta, clickSta, dbclickSta, fromSta, toSta;
var dilute = 0.3;
var mapDiv;

function init() {
  // loadJSON("shanghaiMetro.json", function(){
  var dataJson = data;
  initNetwork(dataJson);
  initNode(dataJson);
  // });
}
function initNetwork(json) {
  var view = network.getView();
  document.body.appendChild(view);
  docW = document.documentElement.clientWidth;
  docH = document.documentElement.clientHeight;
  network.adjustBounds({
    x: (docW - 1800) / 2,
    y: (docH - 1800) / 2,
    width: 1800,
    height: 1800,
  });
  network.setDoubleClickToLinkBundle(false);
  twaver.Link.prototype.isAdjustedToBottom = function () {
    return true;
  };
  network.setZoomManager(new twaver.vector.MixedZoomManager(network));
  network.setMinZoom(0.2);
  network.setMaxZoom(3);
  network.setZoomVisibilityThresholds({
    label: 0.6,
  });
  view.addEventListener("mousemove", function (e) {
    if (focusSta) {
      focusSta.setClient("focus", false);
      focusSta = null;
    }
    eleMm = network.getElementAt(e);
    var msLoc = network.getLogicalPoint(e);
    try {
      if (eleMm instanceof twaver.Node && eleMm.getClient("focus") == false) {
        loc = eleMm.getCenterLocation();
        var distance = _twaver.math.getDistance(msLoc, loc);
        if (distance < eleMm.getWidth() || distance < eleMm.getHeight()) {
          focusSta = eleMm;
          focusSta.setClient("focus", true);
        }
      }
    } catch (error) {
      focusSta = null;
      if (box.contains(eleMm)) {
        console.log(error);
      }
    }
  });
  network.addInteractionListener(function(e){
    //线路弯曲就会响应
    var eleMv = e.element;
    moveSta = moveSta ? moveSta : eleMv;
    if(e.kind == 'liveMoveEnd' && moveSta.getClient('location')){
      moveSta.setCenterLocation(moveSta.getClient('location'));
      moveSta.setClient('focus',false);
      moveSta = null;
    }
  });
  network.addInteractionListener(function(e){
    var elemClick = e.element;
    if(fromSta == null){
      box.forEach(function(element){
        element.setStyle("whole.alpha",1);
        element.setClient('click', false);
      });
    }
    if(toSta){
      if(toSta == fromSta){
        box.forEach(function(elem){
          elem.setStyle('whole.alpha', 1);
        })
      }
      fromSta.setClient('click', false);
      toSta.setClient('click', false);
      fromSta = null;
      toSta = null;
    }
    if(e.kind == 'clickElement' && elemClick.getClient('click')!=null){
      var stationName= elemClick._name.replace("S","Sta");
      window.parent.echarts_line_4('2020-07-15',stationName,24,24);

      if(!fromSta){
        fromSta = elemClick;
        fromSta.setClient('click',true);
      }else if(fromSta==elemClick){
        var line=fromSta.getClient("lines")[0];
        var it= parseInt(line.replace("l",""));
        var itone=it+"号线";
        window.parent.echarts_line_5('2020-07-15',itone,24)
        toSta = elemClick;
        box.forEach(function (element) {
          if(element.getClient('lines')){
            element.setStyle("whole.alpha",1);
            for(var i = 0; i< element.getClient('lines').length; i++) {
              if(fromSta.getClient('lines').indexOf(element.getClient('lines')[i]) >-1){
                i = element.getClient('lines').length;
              }
              if(i == element.getClient('lines').length - 1){
                element.setStyle("whole.alpha",dilute);
              }
            }
          }
        });
      }else{
        toSta = elemClick;
        toSta.setClient('click',true);
      }
    }else{
      fromSta && fromSta.setClient('click',false);
      fromSta = null;
    }
  });
  network.addInteractionListener(function(e){
    if(mapDiv){
      mapDiv.style.display = 'none';
      mapDiv = null;
      dbclickSta = null;
    }
    if(e.kind == 'doubleClickElement' && e.element && e.element.getClassName() == 'twaver.Node' && e.element.getId().length == 6){
      dbclickSta = e.element;
      if(dbclickSta.getClient('coord')){
        coord = dbclickSta.getClient('coord');
        mapDiv = createMap(coord, e.event);

      }else{
      }
    }
  });
  
}

//站点初创

function initNode(json) {
  for (staId in json.stations) {
    var station = json.stations[staId];
    staNode = new twaver.Node({
      id: staId,
      name: station.name,
      image: "station",
    });
    staNode.s("label.color", "rgba(250,250,250,1)");
    staNode.s("label.font", "12px 微软雅黑");
    staNode.s("label.position", station.label);
    staNode.setClient("location", station.loc);
    staNode.setClient("focus", false);
    staNode.setClient("click", false);
    staNode.setClient("dbclick", false);
    staNode.setClient("coord", station.coord);
    staNode.setClient("rotate", station.rotate ? station.rotate : 0);
    box.add(staNode);
  }
  for (lineId in json.lines) {
    var line = json.lines[lineId];
    createLineNode(line, 1);
    createLineNode(line, 2);

    var prevSn, prevSta, prevLink;
    for (staSn in line.stations) {
      if (staSn.substr(3, 1) == "s") {
        var staId = line.stations[staSn];
        var station = json.stations[staId.substr(0, 6)];
        staNode = box.getDataById(station.id);
        if (!prevSta) {
          staNode.setClient("start", true);
        }
        if (!staNode.getClient("lines")) {
          staNode.setClient("lines", [line.id]);
          staNode.setClient("lineColor", line.color);
        } else {
          staNode.getClient("lines")[staNode.getClient("lines").length] =
            line.id;
          var trib = staNode.getId().substr(1, 2) == staSn.substr(1, 2);
          var image = trib ? "shareStop" : "transStop";
          staNode.setImage(image);
        }
        if (staId.length == 8) {
          if (box.getDataById(staId)) {
            staNode = box.getDataById(staId);
          } else {
            staNode = createFollowSta(json, line, staNode, staId);
          }
        }
      } else if (staSn.substr(3, 1) == "p") {
        staNode = createTurnSta(line, staSn);
      }
      if (prevSta && prevSta != staNode) {
        var hscl = haveSameColorLinks(prevSta, staNode, line.color);
        if (hscl) {
          var linkId = lineId + prevSn.substr(3, 3) + staSn.substr(3, 3);
          var hadlinks = twaver.Util.getSharedLinks(prevSta, staNode);
          var hlink = hadlinks.get(0);
          var tip = hlink.getToolTip() + "<br/>" + line.name;
          hlink.setToolTip(tip);
          hlink.getClient("lines")[hlink.getClient("lines").length] = line.id;
          hlink.setClient("branch", linkId);
        } else {
          var linkId = prevSn + staSn.substr(3, 3);
          var link = new twaver.Link(linkId, prevSta, staNode);
          link.s("link.color", line.color);
          link.s("link.width", linkWidth);
          link.s("link.cap", "round");
          link.s("link.from.at.edge", "false");
          link.setClient("lines", [line.id]);
          if (prevLink) {
            link.setClient("prevLink", prevLink);
            prevLink.setClient("nextLink", link);
          }
          link.setToolTip(line.name);
          box.add(link);
        }
      }
      prevSn = staSn;
      prevSta = staNode;
      prevLink = link;
    }
    prevSta.setClient("end", true);
    prevSn = null;
    prevSta = null;
    prevLink = null;
  }
  createSundryNode(json);
  setStationLoc(json);
  setTrunType(json);
}



var createFollowSta = function (json, line, staNode, staId) {
  staFollow = new twaver.Follower(staId);
  staFollow.setImage();
  staFollow.setClient("lineColor", line.color);
  staFollow.setClient("lines", [line.id]);
  staFollow.setHost(staNode);
  var az = azimuth[staId.substr(6, 2)];
  var loc0 = json.stations[staId.substr(0, 6)].loc;
  var loc = { x: loc0.x + az.x, y: loc0.y + az.y };
  staFollow.setClient("location", loc);
  box.add(staFollow);
  return staFollow;
};

var createTurnSta = function (line, staSn) {
  staTurn = new twaver.Node(staSn);
  staTurn.setImage();
  staTurn.setClient("lineColor", line.color);
  staTurn.setClient("lines", [line.id]);
  var loc = line.stations[staSn];
  staTurn.setClient("location", loc);
  box.add(staTurn);
  return staTurn;
};
var createSundryNode = function (json) {

  for (sdId in json.sundrys) {
    var sundry = json.sundrys[sdId];
    sdFollow = new twaver.Follower({
      id: sdId,
      name: sundry.name,
      image: sundry.sign,
    });
    sdFollow.setSize(30, 30);
    sdFollow.s("label.color", "rgba(0,0,0,0)");
    var host = box.getDataById(sundry.station);
    sdFollow.setHost(host);
    var loc = json.stations[sundry.station].loc;
    var ofs = sundry.offset;
    sdFollow.setClient("location", {
      x: loc.x + ofs.x * 30,
      y: loc.y + ofs.y * 30,
    });
    box.add(sdFollow);
  }
};
function isStartEnd(json, staSn) {
  var lineSn = staSn.substr(0, 3);
  var lineLength = json.lines[lineSn].stations.size();
  var staNum = Number(staSn.substr(3, 2));
  links.forEach(function (link) {
    if (staNum == 0 || staNum == lienLength) {
      return true;
    }
  });
  return false;
}

network.setLinkPathFunction(function (linkUI, defaultPoints) {
  var link = linkUI._element;
  var p,
    so = 0,
    os = 0;
  var f = linkUI.getFromPoint();
  var t = linkUI.getToPoint();
  // var points = new twaver.List();
  if (needAddPoint(f, t)) {
    var points = new twaver.List();
    p =
      link.getClient("truntype") == "os"
        ? obliqueStraight(f, t)
        : straightOblique(f, t);
    var sps = addSubjoinPoints(f, p, t, 5);
    points.add(f);
    points.add(sps);
    points.add(t);
  }
  return p ? points : defaultPoints;
});

var setStationLoc = function (json) {
  box.forEach(function (ele) {
    if (ele.getClient("location")) {
      if (ele.getImage() == "shareStop" && ele.getLinks()) {
        var trib =
          (ele.getLinks().size() == 2 &&
            (ele.getClient("end") || ele.getClient("start"))) ||
          ele.getLinks().size() > 2;
        trib && ele.setImage("transStop");
      }
      var loc = ele.getClient("location");
      ele.setCenterLocation(loc);
    }
  });
};

var setTrunType = function (json) {
  box.forEach(function (ele) {
    var id = ele.getId();
    if (ele instanceof twaver.Link) {
      var link = ele;
      var f = link.getFromNode().getCenterLocation();
      var t = link.getToNode().getCenterLocation();
      if (needAddPoint(f, t)) {
        var so = 0,
          os = 0;
        if (link.getClient("prevLink")) {
          so += byPrevPoint(f, t, link).so;
          os += byPrevPoint(f, t, link).os;
        }
        if (link.getClient("nextLink")) {
          os += byNextPoint(f, t, link).os;
          so += byNextPoint(f, t, link).so;
        }
        p = os > so ? obliqueStraight(f, t) : straightOblique(f, t);
        link.setClient("point", p);
        link.setClient("truntype", os > so ? "os" : "so");
      }
    }
  });
};

var needAddPoint = function (p1, p2) {
  var equalX = Math.abs(p1.x - p2.x) < linkWidth / 2 ? true : false;
  var equalY = Math.abs(p1.y - p2.y) < linkWidth / 2 ? true : false;
  var equalXY =
    Math.abs(Math.abs(p2.x - p1.x) - Math.abs(p2.y - p1.y)) < linkWidth / 2
      ? true
      : false;
  if (equalX || equalY || equalXY) {
    return false;
  } else {
    return true;
  }
};

var byPrevPoint = function (p1, p2, link) {
  var p0 = getPrevPoint(p1, p2, link);
  var so, os;
  var pso = straightOblique(p1, p2);
  var pos = obliqueStraight(p1, p2);
  var soAngle = getAngle(p0, p1, pso);
  var osAngle = getAngle(p0, p1, pos);
  return { so: soAngle, os: osAngle };
};

var byNextPoint = function (p1, p2, link) {
  var p3 = getNextPoint(p1, p2, link);
  var so, os;
  var pso = straightOblique(p1, p2);
  var pos = obliqueStraight(p1, p2);
  var soAngle = getAngle(pso, p2, p3);
  var osAngle = getAngle(pos, p2, p3);
  return { so: soAngle, os: osAngle };
};

var getPrevPoint = function (p1, p2, link) {
  var prevLink = link.getClient("prevLink"); //getPrevLink(link);
  var from = prevLink.getFromNode().getCenterLocation();
  var to = prevLink.getToNode().getCenterLocation();
  var p0 = to.x == p1.x && to.y == p1.y ? from : to;
  if (prevLink.getClient("point")) {
    p0 = prevLink.getClient("point");
  }
  return p0;
};

var getNextPoint = function (p1, p2, link) {
  var nextLink = link.getClient("nextLink"); //getNextLink(link);
  var from = nextLink.getFromNode().getCenterLocation();
  var to = nextLink.getToNode().getCenterLocation();
  var p3 = to.x == p2.x && to.y == p2.y ? from : to;
  if (nextLink.getClient("point")) {
    p3 = nextLink.getClient("point");
  }
  return p3;
};

var straightOblique = function (p1, p2) {
  var pointX, pointY;
  if (Math.abs(p2.x - p1.x) > Math.abs(p2.y - p1.y)) {
    var sign = p2.x > p1.x ? 1 : -1;
    pointX = p2.x - Math.abs(p2.y - p1.y) * sign;
    pointY = p1.y;
  } else {
    var sign = p2.y > p1.y ? 1 : -1;
    pointX = p1.x;
    pointY = p2.y - Math.abs(p2.x - p1.x) * sign;
  }
  return { x: pointX, y: pointY };
};

var obliqueStraight = function (p1, p2) {
  var pointX, pointY;
  if (Math.abs(p2.x - p1.x) > Math.abs(p2.y - p1.y)) {
    var sign = p2.x > p1.x ? 1 : -1;
    pointX = p1.x + Math.abs(p2.y - p1.y) * sign;
    pointY = p2.y;
  } else {
    var sign = p2.y > p1.y ? 1 : -1;
    pointX = p2.x;
    pointY = p1.y + Math.abs(p2.x - p1.x) * sign;
  }
  return { x: pointX, y: pointY };
};
function loadJSON(path, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        dataJson = JSON.parse(xhr.responseText);
        callback && callback();
      }
    }
  };
  xhr.open("GET", path, true);
  xhr.send();
}
//线路图标，编号背景颜色与线路颜色相同
function createLineNode(line, n) {
  var loc = line["loc" + n];
  var lineNode = new twaver.Node({
    id: line.id + n,
    name: line.lab,
    image: "lineSign",
  });
  lineNode.s("label.color", "rgba(250,250,250,1)");
  lineNode.s("label.font", "20px 黑体");
  lineNode.s("label.position", "right.right");
  lineNode.setClient("location", loc);
  lineNode.setClient("lineNum", line.num);
  lineNode.setClient("lineColor", line.color);
  lineNode.setClient("lines", [line.id]);
  var tip;
  switch (line.id.substr(0, 1)) {
    case "b":
      tip = "Branch " + line.num;
      break;
    case "e":
      tip = "Extension " + line.num;
      break;
    default:
      tip = "Line " + line.num;
      break;
  }
  lineNode.setToolTip(line.name + "<br/>" + tip);
  box.add(lineNode);
}

//车站图标，站圈颜色与线路颜色相同
twaver.Util.registerImage("station", {
  w: linkWidth * 1.6,
  h: linkWidth * 1.6,
  v: function (data, view) {
    var result = [];
    if (data.getClient("focus")) {
      result.push({
        shape: "circle",
        r: linkWidth * 0.7,
        lineColor: data.getClient("lineColor"),
        lineWidth: linkWidth * 0.2,
        fill: "white",
      });
      result.push({
        shape: "circle",
        r: linkWidth * 0.2,
        fill: data.getClient("lineColor"),
      });
    } else {
      result.push({
        shape: "circle",
        r: linkWidth * 0.6,
        lineColor: data.getClient("lineColor"),
        lineWidth: linkWidth * 0.2,
        fill: "white",
      });
    }
    if (data.getClient("click")) {
      result.push({
        shape: "vector",
        name: "glowCircle",
        w: linkWidth * 3,
        h: linkWidth * 3,
      });
    }
    if (data.getClient("dbclick")) {
      result.push({
        shape: "vector",
        name: "loading",
        w: linkWidth * 5,
        h: linkWidth * 5,
      });
    }
    return result;
  },
});

//线路编号
twaver.Util.registerImage("lineSign", {
  w: 40,
  h: 60,
  font: "30px arial",
  v: function (data, view) {
    var result = [];
    result.push({
      shape: "rect",
      x: -15,
      y: -18,
      w: 32,
      h: 36,
      lineColor: data.getClient("lineColor"),
      fill: data.getClient("lineColor"),
    });
    result.push({
      shape: "text",
      text: data.getClient("lineNum"),
      lineColor: "black",
      lineWidth: 1,
      fill: "white",
    });
    return result;
  },
});

var haveSameColorLinks = function (from, to, color) {
  var links = twaver.Util.getSharedLinks(from, to);
  if (links && links.size() > 0) {
    if (links.get(0).getStyle("link.color") == color) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
};

var getAngle = function (p1, p2, p3) {
  var va = { x: p2.x - p1.x, y: p2.y - p1.y };
  var vb = { x: p2.x - p3.x, y: p2.y - p3.y };
  var angle =
    (Math.acos(
      (vb.x * va.x + vb.y * va.y) /
        (Math.sqrt(va.x * va.x + va.y * va.y) *
          Math.sqrt(vb.x * vb.x + vb.y * vb.y))
    ) *
      180) /
    Math.PI;
  return angle;
};

var addSubjoinPoints = function (p1, p, p2, offset) {
  // zoom = zoom || 1;
  // offset*=zoom;
  var pts = new twaver.List();
  var list = new twaver.List();
  var l1 = _twaver.math.getDistance(p1, p);
  var n1 = l1 < offset ? l1 : offset;
  var l2 = _twaver.math.getDistance(p2, p);
  var n2 = l2 < offset ? l2 : offset;

  var m1 = {
    x: p.x + ((p1.x - p.x) * n1) / l1,
    y: p.y + ((p1.y - p.y) * n1) / l1,
  };
  var m2 = {
    x: p.x + ((p2.x - p.x) * n2) / l2,
    y: p.y + ((p2.y - p.y) * n2) / l2,
  };
  pts.add(m1);
  pts.add(p);
  pts.add(m2);
  return pts;
};

Array.prototype.contain = function (e) {
  for (i = 0; i < this.length && this[i] != e; i++);
  return !(i == this.length);
};

//azimuth
var zoom = network.getZoom() || 1;
var azimuth = {
  bb: { x: 0, y: (linkWidth * zoom) / 2 },
  tt: { x: 0, y: (-linkWidth * zoom) / 2 },
  rr: { x: (linkWidth * zoom) / 2, y: 0 },
  ll: { x: -linkWidth / 2, y: 0 },
  br: { x: (linkWidth * zoom * 0.7) / 2, y: (linkWidth * zoom * 0.7) / 2 },
  bl: { x: (-linkWidth * zoom * 0.7) / 2, y: (linkWidth * zoom * 0.7) / 2 },
  tr: { x: (linkWidth * zoom * 0.7) / 2, y: (-linkWidth * zoom * 0.7) / 2 },
  tl: { x: (-linkWidth * zoom * 0.7) / 2, y: (-linkWidth * zoom * 0.7) / 2 },
  BB: { x: 0, y: linkWidth * zoom },
  TT: { x: 0, y: -linkWidth * zoom },
  RR: { x: linkWidth * zoom, y: 0 },
  LL: { x: -linkWidth, y: 0 },
  BR: { x: linkWidth * zoom * 0.7, y: linkWidth * zoom * 0.7 },
  BL: { x: -linkWidth * zoom * 0.7, y: linkWidth * zoom * 0.7 },
  TR: { x: linkWidth * zoom * 0.7, y: -linkWidth * zoom * 0.7 },
  TL: { x: -linkWidth * zoom * 0.7, y: -linkWidth * zoom * 0.7 },
};

function createMap(coord, event) {
  var lat = coord.lat || 31.188;
  var lng = coord.lng || 121.425;
  var divW = mapW + "px" || "300px";
  var divH = mapH + "px" || "200px";
  var div = document.createElement("div");
  div.style.width = divW;
  div.style.height = divH;
  //定义map变量 调用 qq.maps.Map() 构造函数   获取地图显示容器
  var map = new qq.maps.Map(div, {
    center: new qq.maps.LatLng(lat, lng), // 地图的中心地理坐标。
    zoom: 15,
  });
  document.body.appendChild(div);
  // div.style.display = 'none';
  // div.style.zIndex = 100;
  div.style.padding = "2px 2px 2px 2px";
  div.style.border = "solid 2px blue";
  // div.style.border-width = 5px;
  // div.style.border-color = 'Black';
  div.style.display = "block";
  if (event.clientX < docW / 2) {
    div.style.left = event.clientX + "px";
  } else {
    div.style.left = event.clientX - mapW + "px";
  }
  if (event.clientY < docH / 2) {
    div.style.top = event.clientY + "px";
  } else {
    div.style.top = event.clientY - mapH + "px";
  }
  return div;
}




var data = {
  stations: {
    l01s01: {
      id: "l01s01",
      label: "left.left",
      loc: {
        x: 107,
        y: 292,
      },
      name: "S104",
    },
    l01s02: {
      id: "l01s02",
      label: "left.left",
      loc: {
        x: 119,
        y: 336,
      },
      name: "S65",
    },
    l01s03: {
      id: "l01s03",
      label: "left.left",
      loc: {
        x: 132,
        y: 379,
      },
      name: "S49",
    },
    l01s04: {
      id: "l01s04",
      label: "bottom.bottom",
      loc: {
        x: 161,
        y: 436,
      },
      name: "S149",
    },
    l01s05: {
      id: "l01s05",
      label: "bottom.bottom",
      loc: {
        x: 211,
        y: 478,
      },
      name: "S74",
    },
    l01s06: {
      id: "l01s06",
      label: "bottom.bottom",
      loc: {
        x: 285,
        y: 478,
      },
      name: "S128",
    },
    l01s07: {
      id: "l01s07",
      label: "bottom.bottom",
      loc: {
        x: 350,
        y: 478,
      },
      name: "S34",
    },
    l01s08: {
      id: "l01s08",
      label: "bottom.bottom",
      loc: {
        x: 416,
        y: 478,
      },
      name: "S106",
    },
    l01s09: {
      id: "l01s09",
      label: "bottom.bottom",
      loc: {
        x: 458,
        y: 478,
      },
      name: "S110",
    },
    l01s10: {
      id: "l01s10",
      label: "bottom.bottom",
      loc: {
        x: 509,
        y: 478,
      },
      name: "S97",
    },
    l01s11: {
      id: "l01s11",
      label: "bottom.bottom",
      loc: {
        x: 573,
        y: 478,
      },
      name: "S80",
    },
    l01s12: {
      id: "l01s12",
      label: "bottom.bottom",
      loc: {
        x: 623,
        y: 478,
      },
      name: "S89",
    },
    l01s13: {
      id: "l01s13",
      label: "bottom.bottom",
      loc: {
        x: 686,
        y: 478,
      },
      name: "S64",
    },
    l01s14: {
      id: "l01s14",
      label: "bottom.bottom",
      loc: {
        x: 739,
        y: 478,
      },
      name: "S150",
    },
    l01s15: {
      id: "l01s15",
      label: "bottom.bottom",
      loc: {
        x: 780,
        y: 478,
      },
      name: "S154",
    },
    l01s16: {
      id: "l01s16",
      label: "bottom.bottom",
      loc: {
        x: 870,
        y: 478,
      },
      name: "S107",
    },
    l01s17: {
      id: "l01s17",
      label: "bottom.bottom",
      loc: {
        x: 941,
        y: 478,
      },
      name: "S83",
    },
    l01s18: {
      id: "l01s18",
      label: "bottom.bottom",
      loc: {
        x: 985,
        y: 478,
      },
      name: "S108",
    },
    l01s19: {
      id: "l01s19",
      label: "bottom.bottom",
      loc: {
        x: 1042,
        y: 478,
      },
      name: "S159",
    },
    l01s20: {
      id: "l01s20",
      label: "bottom.bottom",
      loc: {
        x: 1117,
        y: 478,
      },
      name: "S1",
    },
    l02s01: {
      id: "l02s01",
      label: "bottom.bottom",
      loc: {
        x: 469,
        y: 826,
      },
      name: "S51",
    },
    l02s02: {
      id: "l02s02",
      label: "bottom.bottom",
      loc: {
        x: 508,
        y: 818,
      },
      name: "S105",
    },
    l02s03: {
      id: "l02s03",
      label: "bottom.bottom",
      loc: {
        x: 547,
        y: 805,
      },
      name: "S24",
    },
    l02s04: {
      id: "l02s04",
      label: "right.right",
      loc: {
        x: 576,
        y: 788,
      },
      name: "S139",
    },
    l02s05: {
      id: "l02s05",
      label: "right.right",
      loc: {
        x: 576,
        y: 756,
      },
      name: "S71",
    },
    l02s06: {
      id: "l02s06",
      label: "right.right",
      loc: {
        x: 576,
        y: 719,
      },
      name: "S57",
    },
    l02s07: {
      id: "l02s07",
      label: "right.right",
      loc: {
        x: 576,
        y: 682,
      },
      name: "S76",
    },
    l02s08: {
      id: "l02s08",
      label: "right.right",
      loc: {
        x: 576,
        y: 649,
      },
      name: "S52",
    },
    l02s09: {
      id: "l02s09",
      label: "right.right",
      loc: {
        x: 576,
        y: 606,
      },
      name: "S68",
    },
    l02s10: {
      id: "l02s10",
      label: "right.right",
      loc: {
        x: 576,
        y: 570,
      },
      name: "S151",
    },
    l02s11: {
      id: "l02s11",
      label: "right.right",
      loc: {
        x: 584,
        y: 530,
      },
      name: "S48",
    },
    l02s12: {
      id: "l02s12",
      label: "right.right",
      loc: {
        x: 599,
        y: 516,
      },
      name: "S27",
    },
    l02s13: {
      id: "l02s13",
      label: "bottom.bottom",
      loc: {
        x: 640,
        y: 448,
      },
      name: "S81",
    },
    l02s14: {
      id: "l02s14",
      label: "bottom.bottom",
      loc: {
        x: 661,
        y: 412,
      },
      name: "S127",
    },
    l02s15: {
      id: "l02s15",
      label: "bottom.bottom",
      loc: {
        x: 699,
        y: 412,
      },
      name: "S123",
    },
    l02s16: {
      id: "l02s16",
      label: "bottom.bottom",
      loc: {
        x: 732,
        y: 412,
      },
      name: "S47",
    },
    l02s17: {
      id: "l02s17",
      label: "top.top",
      loc: {
        x: 784,
        y: 412,
      },
      name: "S18",
    },
    l02s18: {
      id: "l02s18",
      label: "bottom.bottom",
      loc: {
        x: 821,
        y: 412,
      },
      name: "S79",
    },
    l02s19: {
      id: "l02s19",
      label: "bottom.bottom",
      loc: {
        x: 858,
        y: 412,
      },
      name: "S78",
    },
    l02s20: {
      id: "l02s20",
      label: "bottom.bottom",
      loc: {
        x: 904,
        y: 412,
      },
      name: "S53",
    },
    l02s21: {
      id: "l02s21",
      label: "bottom.bottom",
      loc: {
        x: 931,
        y: 412,
      },
      name: "S163",
    },
    l02s22: {
      id: "l02s22",
      label: "top.top",
      loc: {
        x: 970,
        y: 412,
      },
      name: "S9",
    },
    l02s23: {
      id: "l02s23",
      label: "left.left",
      loc: {
        x: 975,
        y: 460,
      },
      name: "S129",
    },
    l03s01: {
      id: "l03s01",
      label: "right.right",
      loc: {
        x: 1022,
        y: 826,
      },
      name: "S155",
    },
    l03s02: {
      id: "l03s02",
      label: "right.right",
      loc: {
        x: 1022,
        y: 797,
      },
      name: "S143",
    },
    l03s03: {
      id: "l03s03",
      label: "right.right",
      loc: {
        x: 1022,
        y: 770,
      },
      name: "S156",
    },
    l03s04: {
      id: "l03s04",
      label: "right.right",
      loc: {
        x: 1022,
        y: 735,
      },
      name: "S61",
    },
    l03s05: {
      id: "l03s05",
      label: "right.right",
      loc: {
        x: 1022,
        y: 700,
      },
      name: "S50",
    },
    l03s06: {
      id: "l03s06",
      label: "right.right",
      loc: {
        x: 1022,
        y: 674,
      },
      name: "S119",
    },
    l03s07: {
      id: "l03s07",
      label: "left.left",
      loc: {
        x: 1000,
        y: 653,
      },
      name: "S66",
    },
    l03s08: {
      id: "l03s08",
      label: "left.left",
      loc: {
        x: 983,
        y: 636,
      },
      name: "S12",
    },
    l03s09: {
      id: "l03s09",
      label: "left.left",
      loc: {
        x: 961,
        y: 614,
      },
      name: "S161",
    },
    l03s10: {
      id: "l03s10",
      label: "left.left",
      loc: {
        x: 941,
        y: 594,
      },
      name: "S21",
    },
    l03s11: {
      id: "l03s11",
      label: "left.left",
      loc: {
        x: 922,
        y: 574,
      },
      name: "S133",
    },
    l03s12: {
      id: "l03s12",
      label: "left.left",
      loc: {
        x: 904,
        y: 558,
      },
      name: "S22",
    },
    l03s13: {
      id: "l03s13",
      label: "left.left",
      loc: {
        x: 883,
        y: 539,
      },
      name: "S138",
    },
    l03s14: {
      id: "l03s14",
      label: "left.left",
      loc: {
        x: 864,
        y: 521,
      },
      name: "S41",
    },
    l03s15: {
      id: "l03s15",
      label: "left.left",
      loc: {
        x: 847,
        y: 500,
      },
      name: "S30",
    },
    l03s16: {
      id: "l03s16",
      label: "right.right",
      loc: {
        x: 805,
        y: 460,
      },
      name: "S67",
    },
    l03s17: {
      id: "l03s17",
      label: "left.left",
      loc: {
        x: 789,
        y: 442,
      },
      name: "S144",
    },
    l03s18: {
      id: "l03s18",
      label: "right.right",
      loc: {
        x: 738,
        y: 390,
      },
      name: "S5",
    },
    l03s19: {
      id: "l03s19",
      label: "right.right",
      loc: {
        x: 729,
        y: 366,
      },
      name: "S98",
    },
    l03s20: {
      id: "l03s20",
      label: "right.right",
      loc: {
        x: 729,
        y: 297,
      },
      name: "S29",
    },
    l03s21: {
      id: "l03s21",
      label: "right.right",
      loc: {
        x: 729,
        y: 276,
      },
      name: "S126",
    },
    l03s22: {
      id: "l03s22",
      label: "right.right",
      loc: {
        x: 729,
        y: 234,
      },
      name: "S40",
    },
    l03s23: {
      id: "l03s23",
      label: "right.right",
      loc: {
        x: 729,
        y: 200,
      },
      name: "S131",
    },
    l03s24: {
      id: "l03s24",
      label: "topright.topright",
      loc: {
        x: 729,
        y: 157,
      },
      name: "S39",
    },
    l03s25: {
      id: "l03s25",
      label: "left.left",
      loc: {
        x: 729,
        y: 120,
      },
      name: "S100",
    },
    l03s26: {
      id: "l03s26",
      label: "topleft.topleft",
      loc: {
        x: 759,
        y: 111,
      },
      name: "S167",
    },
    l03s27: {
      id: "l03s27",
      label: "bottom.bottom",
      loc: {
        x: 785,
        y: 105,
      },
      name: "S113",
    },
    l03s28: {
      id: "l03s28",
      label: "bottomright.bottomright",
      loc: {
        x: 806,
        y: 99,
      },
      name: "S141",
    },
    l03s29: {
      id: "l03s29",
      label: "bottom.bottom",
      loc: {
        x: 883,
        y: 79,
      },
      name: "S142",
    },
    l03s30: {
      id: "l03s30",
      label: "top.top",
      loc: {
        x: 941,
        y: 63,
      },
      name: "S158",
    },
    l03s31: {
      id: "l03s31",
      label: "top.top",
      loc: {
        x: 969,
        y: 56,
      },
      name: "S44",
    },
    l03s32: {
      id: "l03s32",
      label: "top.top",
      loc: {
        x: 996,
        y: 49,
      },
      name: "S117",
    },
    l03s33: {
      id: "l03s33",
      label: "top.top",
      loc: {
        x: 1028,
        y: 40,
      },
      name: "S147",
    },
    l03s34: {
      id: "l03s34",
      label: "top.top",
      loc: {
        x: 1059,
        y: 35,
      },
      name: "S42",
    },
    l03s35: {
      id: "l03s35",
      label: "top.top",
      loc: {
        x: 1084,
        y: 33,
      },
      name: "S35",
    },
    l03s36: {
      id: "l03s36",
      label: "topright.topright",
      loc: {
        x: 1108,
        y: 42,
      },
      name: "S109",
    },
    l03s37: {
      id: "l03s37",
      label: "topright.topright",
      loc: {
        x: 1135,
        y: 66,
      },
      name: "S33",
    },
    l03s38: {
      id: "l03s38",
      label: "topright.topright",
      loc: {
        x: 1155,
        y: 83,
      },
      name: "S112",
    },
    l03s39: {
      id: "l03s39",
      label: "topright.topright",
      loc: {
        x: 1173,
        y: 98,
      },
      name: "S153",
    },
    l03s40: {
      id: "l03s40",
      label: "topright.topright",
      loc: {
        x: 1200,
        y: 113
            },
      name: "S125",
    },
    l03s41: {
      id: "l03s41",
      label: "topright.topright",
      loc: {
        x: 1218,
        y: 125,
      },
      name: "S121",
    },
    l03s42: {
      id: "l03s42",
      label: "right.right",
      loc: {
        x: 1240,
        y: 135,
      },
      name: "S11",
    },
    l04s01: {
      id: "l04s01",
      label: "bottom.bottom",
      loc: {
        x: 689,
        y: 181,
      },
      name: "S84",
    },
    l04s02: {
      id: "l04s02",
      label: "topright.topright",
      loc: {
        x: 729,
        y: 181,
      },
      name: "S59",
    },
    l04s03: {
      id: "l04s03",
      label: "bottom.bottom",
      loc: {
        x: 795,
        y: 181,
      },
      name: "S19",
    },
    l04s04: {
      id: "l04s04",
      label: "bottom.bottom",
      loc: {
        x: 904,
        y: 181,
      },
      name: "S62",
    },
    l04s05: {
      id: "l04s05",
      label: "bottom.bottom",
      loc: {
        x: 960,
        y: 181,
      },
      name: "S165",
    },
    l04s06: {
      id: "l04s06",
      label: "bottom.bottom",
      loc: {
        x: 1017,
        y: 181,
      },
      name: "S58",
    },
    l04s07: {
      id: "l04s07",
      label: "bottom.bottom",
      loc: {
        x: 1073,
        y: 181,
      },
      name: "S38",
    },
    l05s01: {
      id: "l05s01",
      label: "bottom.bottom",
      loc: {
        x: 504,
        y: 606,
      },
      name: "S54",
    },
    l05s02: {
      id: "l05s02",
      label: "bottom.bottom",
      loc: {
        x: 504,
        y: 544,
      },
      name: "S69",
    },
    l05s03: {
      id: "l05s03",
      label: "bottom.bottom",
      loc: {
        x: 504,
        y: 415,
      },
      name: "S16",
    },
    l05s04: {
      id: "l05s04",
      label: "bottom.bottom",
      loc: {
        x: 504,
        y: 369,
      },
      name: "S37",
    },
    l05s05: {
      id: "l05s05",
      label: "bottom.bottom",
      loc: {
        x: 504,
        y: 281,
      },
      name: "S132",
    },
    l05s06: {
      id: "l05s06",
      label: "bottom.bottom",
      loc: {
        x: 523,
        y: 225,
      },
      name: "S96",
    },
    l05s07: {
      id: "l05s07",
      label: "bottom.bottom",
      loc: {
        x: 568,
        y: 221,
      },
      name: "S10",
    },
    l05s08: {
      id: "l05s08",
      label: "bottom.bottom",
      loc: {
        x: 605,
        y: 161,
      },
      name: "S43",
    },
    l10s01: {
      id: "l10s01",
      label: "top.top",
      loc: {
        x: 397,
        y: 72,
      },
      name: "S157",
    },
    l10s02: {
      id: "l10s02",
      label: "top.top",
      loc: {
        x: 478,
        y: 72,
      },
      name: "S114",
    },
    l10s03: {
      id: "l10s03",
      label: "top.top",
      loc: {
        x: 537,
        y: 72,
      },
      name: "S168",
    },
    l10s04: {
      id: "l10s04",
      label: "top.top",
      loc: {
        x: 610,
        y: 72,
      },
      name: "S135",
    },
    l10s05: {
      id: "l10s05",
      label: "top.top",
      loc: {
        x: 665,
        y: 72,
      },
      name: "S134",
    },
    l10s06: {
      id: "l10s06",
      label: "top.top",
      loc: {
        x: 763,
        y: 72,
      },
      name: "S85",
    },
    l10s07: {
      id: "l10s07",
      label: "right.right",
      loc: {
        x: 859,
        y: 134,
      },
      name: "S2",
    },
    l10s08: {
      id: "l10s08",
      label: "bottom.bottom",
      loc: {
        x: 840,
        y: 222,
      },
      name: "S4",
    },
    l10s09: {
      id: "l10s09",
      label: "bottom.bottom",
      loc: {
        x: 795,
        y: 234,
      },
      name: "S103",
    },
    l10s10: {
      id: "l10s10",
      label: "topleft.topleft",
      loc: {
        x: 725,
        y: 255,
      },
      name: "S145",
    },
    l10s11: {
      id: "l10s11",
      label: "bottom.bottom",
      loc: {
        x: 686,
        y: 265,
      },
      name: "S88",
    },
    l10s12: {
      id: "l10s12",
      label: "bottom.bottom",
      loc: {
        x: 686,
        y: 318,
      },
      name: "S87",
    },
    l10s13: {
      id: "l10s13",
      label: "bottom.bottom",
      loc: {
        x: 686,
        y: 379,
      },
      name: "S94",
    },
    l10s14: {
      id: "l10s14",
      label: "right.right",
      loc: {
        x: 686,
        y: 518,
      },
      name: "S160",
    },
    l10s15: {
      id: "l10s15",
      label: "right.right",
      loc: {
        x: 686,
        y: 551,
      },
      name: "S7",
    },
    l10s16: {
      id: "l10s16",
      label: "right.right",
      loc: {
        x: 686,
        y: 606,
      },
      name: "S6",
    },
    l10s17: {
      id: "l10s17",
      label: "right.right",
      loc: {
        x: 686,
        y: 644,
      },
      name: "S8",
    },
    l10s18: {
      id: "l10s18",
      label: "right.right",
      loc: {
        x: 686,
        y: 690,
      },
      name: "S75",
    },
    l10s19: {
      id: "l10s19",
      label: "right.right",
      loc: {
        x: 686,
        y: 765,
      },
      name: "S102",
    },
    l11s01: {
      id: "l11s01",
      label: "bottom.bottom",
      loc: {
        x: 90,
        y: 80,
      },
      name: "S28",
    },
    l11s02: {
      id: "l11s02",
      label: "bottom.bottom",
      loc: {
        x: 120,
        y: 79,
      },
      name: "S124",
    },
    l11s03: {
      id: "l11s03",
      label: "bottom.bottom",
      loc: {
        x: 155,
        y: 80,
      },
      name: "S99",
    },
    l11s04: {
      id: "l11s04",
      label: "topright.topright",
      loc: {
        x: 195,
        y: 124,
      },
      name: "S166",
    },
    l11s05: {
      id: "l11s05",
      label: "topright.topright",
      loc: {
        x: 218,
        y: 146,
      },
      name: "S36",
    },
    l11s06: {
      id: "l11s06",
      label: "topright.topright",
      loc: {
        x: 240,
        y: 168,
      },
      name: "S122",
    },
    l11s07: {
      id: "l11s07",
      label: "topright.topright",
      loc: {
        x: 267,
        y: 196,
      },
      name: "S77",
    },
    l11s08: {
      id: "l11s08",
      label: "bottom.bottom",
      loc: {
        x: 312,
        y: 242,
      },
      name: "S140",
    },
    l11s09: {
      id: "l11s09",
      label: "bottom.bottom",
      loc: {
        x: 336,
        y: 263,
      },
      name: "S111",
    },
    l11s10: {
      id: "l11s10",
      label: "bottom.bottom",
      loc: {
        x: 357,
        y: 287,
      },
      name: "S13",
    },
    l11s11: {
      id: "l11s11",
      label: "bottom.bottom",
      loc: {
        x: 380,
        y: 350,
      },
      name: "S70",
    },
    l11s12: {
      id: "l11s12",
      label: "bottom.bottom",
      loc: {
        x: 416,
        y: 318,
      },
      name: "S55",
    },
    l11s13: {
      id: "l11s13",
      label: "bottom.bottom",
      loc: {
        x: 457,
        y: 318,
      },
      name: "S20",
    },
    l11s14: {
      id: "l11s14",
      label: "bottom.bottom",
      loc: {
        x: 503,
        y: 318,
      },
      name: "S23",
    },
    l11s15: {
      id: "l11s15",
      label: "bottom.bottom",
      loc: {
        x: 546,
        y: 318,
      },
      name: "S56",
    },
    l11s16: {
      id: "l11s16",
      label: "bottom.bottom",
      loc: {
        x: 581,
        y: 318,
      },
      name: "S118",
    },
    l11s17: {
      id: "l11s17",
      label: "top.top",
      loc: {
        x: 622,
        y: 318,
      },
      name: "S115",
    },
    l11s18: {
      id: "l11s18",
      label: "bottom.bottom",
      loc: {
        x: 640,
        y: 318,
      },
      name: "S162",
    },
    l11s19: {
      id: "l11s19",
      label: "bottom.bottom",
      loc: {
        x: 729,
        y: 318,
      },
      name: "S15",
    },
    l11s20: {
      id: "l11s20",
      label: "bottom.bottom",
      loc: {
        x: 783,
        y: 318,
      },
      name: "S86",
    },
    l11s21: {
      id: "l11s21",
      label: "bottom.bottom",
      loc: {
        x: 820,
        y: 318,
      },
      name: "S46",
    },
    l11s22: {
      id: "l11s22",
      label: "bottom.bottom",
      loc: {
        x: 854,
        y: 318,
      },
      name: "S63",
    },
    l11s23: {
      id: "l11s23",
      label: "bottom.bottom",
      loc: {
        x: 893,
        y: 318,
      },
      name: "S3",
    },
    l11s24: {
      id: "l11s24",
      label: "bottom.bottom",
      loc: {
        x: 925,
        y: 318,
      },
      name: "S25",
    },
    l11s25: {
      id: "l11s25",
      label: "bottom.bottom",
      loc: {
        x: 956,
        y: 318,
      },
      name: "S146",
    },
    l11s26: {
      id: "l11s26",
      label: "bottom.bottom",
      loc: {
        x: 990,
        y: 335,
      },
      name: "S130",
    },
    l11s27: {
      id: "l11s27",
      label: "bottom.bottom",
      loc: {
        x: 1018,
        y: 352,
      },
      name: "S120",
    },
    l11s28: {
      id: "l11s28",
      label: "bottom.bottom",
      loc: {
        x: 1055,
        y: 370,
      },
      name: "S82",
    },
    l11s29: {
      id: "l11s29",
      label: "bottom.bottom",
      loc: {
        x: 1083,
        y: 389,
      },
      name: "S164",
    },
    l11s30: {
      id: "l11s30",
      label: "bottom.bottom",
      loc: {
        x: 1124,
        y: 413,
      },
      name: "S152",
    },
    l11s31: {
      id: "l11s31",
      label: "bottom.bottom",
      loc: {
        x: 1166,
        y: 439,
      },
      name: "S45",
    },
    l12s01: {
      id: "l12s01",
      label: "bottom.bottom",
      loc: {
        x: 267,
        y: 800,
      },
      name: "S14",
    },
    l12s02: {
      id: "l12s02",
      label: "right.right",
      loc: {
        x: 267,
        y: 760,
      },
      name: "S73",
    },
    l12s03: {
      id: "l12s03",
      label: "right.right",
      loc: {
        x: 267,
        y: 720,
      },
      name: "S148",
    },
    l12s04: {
      id: "l12s04",
      label: "right.right",
      loc: {
        x: 297,
        y: 690,
      },
      name: "S60",
    },
    l12s05: {
      id: "l12s05",
      label: "right.right",
      loc: {
        x: 297,
        y: 650,
      },
      name: "S91",
    },
    l12s06: {
      id: "l12s06",
      label: "right.right",
      loc: {
        x: 297,
        y: 590,
      },
      name: "S32",
    },
    l12s07: {
      id: "l12s07",
      label: "bottom.bottom",
      loc: {
        x: 255,
        y: 575,
      },
      name: "S116",
    },
    l12s08: {
      id: "l12s08",
      label: "right.right",
      loc: {
        x: 255,
        y: 510,
      },
      name: "S92",
    },
    l12s09: {
      id: "l12s09",
      label: "right.right",
      loc: {
        x: 255,
        y: 441,
      },
      name: "S31",
    },
    l12s10: {
      id: "l12s10",
      label: "right.right",
      loc: {
        x: 255,
        y: 408,
      },
      name: "S93",
    },
    l12s11: {
      id: "l12s11",
      label: "right.right",
      loc: {
        x: 232,
        y: 368,
      },
      name: "S72",
    },
    l12s12: {
      id: "l12s12",
      label: "right.right",
      loc: {
        x: 221,
        y: 325,
      },
      name: "S95",
    },
    l12s13: {
      id: "l12s13",
      label: "right.right",
      loc: {
        x: 206,
        y: 273,
      },
      name: "S90",
    },
    l12s14: {
      id: "l12s14",
      label: "left.left",
      loc: {
        x: 237,
        y: 244,
      },
      name: "S26",
    },
    l12s15: {
      id: "l12s15",
      label: "bottom.bottom",
      loc: {
        x: 262,
        y: 221,
      },
      name: "S17",
    },
    l12s16: {
      id: "l12s16",
      label: "bottom.bottom",
      loc: {
        x: 354,
        y: 213,
      },
      name: "S101",
    },
    l12s17: {
      id: "l12s17",
      label: "left.left",
      loc: {
        x: 363,
        y: 183,
      },
      name: "S136",
    },
    l12s18: {
      id: "l12s18",
      label: "left.left",
      loc: {
        x: 363,
        y: 145,
      },
      name: "S137",
    },
  },
  lines: {
    l01: {
      id: "l01",
      name: "1号线",
      color: "#e52035",
      num: "1",
      lab: "号线",
      loc1: {
        x: 90,
        y: 250,
      },
      loc2: {
        x: 1100,
        y: 520,
      },
      stations: {
        l01s01: "l01s01",
        l01s02: "l01s02",
        l01s03: "l01s03",

        l01s04: "l01s04",
        l01s05: "l01s05",
        l01s06: "l01s06",
        l01s07: "l01s07",
        l01s08: "l01s08",
        l01s09: "l01s09",
        l01s10: "l01s10",
        l01s11: "l01s11",
        l01s12: "l01s12",
        l01s13: "l01s13",
        l01s14: "l01s14",
        l01s15: "l01s15",
        l01s16: "l01s16",
        l01s17: "l01s17",
        l01s18: "l01s18",
        l01s19: "l01s19",
        l01s20: "l01s20",
      },
    },
    l02: {
      id: "l02",
      name: "2号线",
      color: "#8dc600",
      num: "2",
      lab: "号线",
      loc1: {
        x: 400,
        y: 826,
      },
      loc2: {
        x: 1000,
        y: 440,
      },
      stations: {
        l02s01: "l02s01",
        l02s02: "l02s02",
        l02s03: "l02s03",
        l02s04: "l02s04",
        l02s05: "l02s05",
        l02s06: "l02s06",
        l02s07: "l02s07",
        l02s08: "l02s08",
        l02s09: "l02s09",
        l02s10: "l02s10",
        l02s11: "l02s11",
        l02s12: "l02s12",
        l02s13: "l02s13",
        l02s14: "l02s14",
        l02s15: "l02s15",
        l02s16: "l02s16",
        l02s17: "l02s17",
        l02s18: "l02s18",
        l02s19: "l02s19",
        l02s20: "l02s20",
        l02s21: "l02s21",
        l02s22: "l02s22",
        l02s23: "l02s23",
      },
    },
    l03: {
      id: "l03",
      name: "3号线",
      color: "#118840",
      num: "3",
      lab: "号线",
      loc1: {
        x: 1022,
        y: 880,
      },
      loc2: {
        x: 1320,
        y: 135,
      },
      stations: {
        l03s01: "l03s01",
        l03s02: "l03s02",
        l03s03: "l03s03",
        l03s04: "l03s04",
        l03s05: "l03s05",
        l03s06: "l03s06",
        l03s07: "l03s07",
        l03s08: "l03s08",
        l03s09: "l03s09",
        l03s10: "l03s10",
        l03s11: "l03s11",
        l03s12: "l03s12",
        l03s13: "l03s13",
        l03s14: "l03s14",
        l03s15: "l03s15",
        l03s16: "l03s16",
        l03s17: "l03s17",
        l03s18: "l03s18",
        l03s19: "l03s19",
        l03s20: "l03s20",
        l03s21: "l03s21",
        l03s22: "l03s22",
        l03s23: "l03s23",
        l03s24: "l03s24",
        l03s25: "l03s25",
        l03s26: "l03s26",
        l03s27: "l03s27",
        l03s28: "l03s28",
        l03s29: "l03s29",
        l03s30: "l03s30",
        l03s31: "l03s31",
        l03s32: "l03s32",
        l03s33: "l03s33",
        l03s34: "l03s34",
        l03s35: "l03s35",
        l03s36: "l03s36",
        l03s37: "l03s37",
        l03s38: "l03s38",
        l03s39: "l03s39",
        l03s40: "l03s40",
        l03s41: "l03s41",
        l03s42: "l03s42",
      },
    },
    l04: {
      id: "l04",
      name: "4号线",
      color: "#ffd800",
      num: "4",
      lab: "号线",
      loc1: {
        x: 650,
        y: 150,
      },
      loc2: {
        x: 1100,
        y: 151,
      },
      stations: {
        l04s01: "l04s01",
        l04s02: "l04s02",
        l04s03: "l04s03",
        l04s04: "l04s04",
        l04s05: "l04s05",
        l04s06: "l04s06",
        l04s07: "l04s07",
      },
    },
    l05: {
      id: "l05",
      name: "5号线",
      color: "#d21874",
      num: "5",
      lab: "号线",
      loc1: {
        x: 504,
        y: 666,
      },
      loc2: {
        x: 530,
        y: 141,
      },
      stations: {
        l05s01: "l05s01",
        l05s02: "l05s02",
        l05s03: "l05s03",
        l05s04: "l05s04",
        l05s05: "l05s05",
        l05s06: "l05s06",
        l05s07: "l05s07",
        l05s08: "l05s08",
      },
    },
    l10: {
      id: "l10",
      name: "10号线",
      color: "#219ce0",
      num: "10",
      lab: "号线",
      loc1: {
        x: 370,
        y: 40,
      },
      loc2: {
        x: 750,
        y: 755,
      },
      stations: {
        l10s01: "l10s01",
        l10s02: "l10s02",
        l10s03: "l10s03",
        l10s04: "l10s04",
        l10s05: "l10s05",
        l10s06: "l10s06",
        l10s07: "l10s07",
        l10s08: "l10s08",
        l10s09: "l10s09",
        l10s10: "l10s10",
        l10s11: "l10s11",
        l10s12: "l10s12",
        l10s13: "l10s13",
        l10s14: "l10s14",
        l10s15: "l10s15",
        l10s16: "l10s16",
        l10s17: "l10s17",
        l10s18: "l10s18",
        l10s19: "l10s19",
      },
    },
    l11: {
      id: "l11",
      name: "11号线",
      color: "#7b2031",
      num: "11",
      lab: "号线",
      loc1: {
        x: 40,
        y: 55,
      },
      loc2: {
        x: 1216,
        y: 420,
      },
      stations: {
        l11s01: "l11s01",
        l11s02: "l11s02",
        l11s03: "l11s03",
        l11s04: "l11s04",
        l11s05: "l11s05",
        l11s06: "l11s06",
        l11s07: "l11s07",
        l11s08: "l11s08",
        l11s09: "l11s09",
        l11s10: "l11s10",
        l11s11: "l11s11",
        l11s12: "l11s12",
        l11s13: "l11s13",
        l11s14: "l11s14",
        l11s15: "l11s15",
        l11s16: "l11s16",
        l11s17: "l11s17",
        l11s18: "l11s18",
        l11s19: "l11s19",
        l11s20: "l11s20",
        l11s21: "l11s21",
        l11s22: "l11s22",
        l11s23: "l11s23",
        l11s24: "l11s24",
        l11s25: "l11s25",
        l11s26: "l11s26",
        l11s27: "l11s27",
        l11s28: "l11s28",
        l11s29: "l11s29",
        l11s30: "l11s30",
        l11s31: "l11s31",
      },
    },
    l12: {
      id: "l12",
      name: "12号线",
      color: "#77ccaa",
      num: "12",
      lab: "号线",
      loc1: {
        x: 267,
        y: 855,
      },
      loc2: {
        x: 410,
        y: 147,
      },
      stations: {
        l12s01: "l12s01",
        l12s02: "l12s02",
        l12s03: "l12s03",
        l12s04: "l12s04",
        l12s05: "l12s05",
        l12s06: "l12s06",
        l12s07: "l12s07",
        l12s08: "l12s08",
        l12s09: "l12s09",
        l12s10: "l12s10",
        l12s11: "l12s11",
        l12s12: "l12s12",
        l12s13: "l12s13",
        l12s14: "l12s14",
        l12s15: "l12s15",
        l12s16: "l12s16",
        l12s17: "l12s17",
        l12s18: "l12s18",
      },
    },
  },
};
