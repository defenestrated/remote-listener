var _ = require('lodash'); // utility
// var $ = require('zepto');

window.app = {
  threshhold: 0.8,
  sensordata: {
    current: [],
    previous: [],
    mins: [],
    maxs: []
  }
}

console.log(app)

socket.on("setup", function(data) {
  console.log("socket connected!", data)

  _(data.openchannels).times(i => {
    var wrapper = document.createElement("div")
    wrapper.classList.add("reading-display")
    wrapper.id = "reading" + i
    _(4).times(i => {
      var dp = document.createElement("div")
      dp.classList.add("data-point")
      wrapper.append(dp)
    })
    document.querySelector(".readings").append(wrapper)
  })
})


socket.on("reading", function(data) {
  var a = app.sensordata
  var c = data.chnum

  a.current[c] = data.reading
  setleast(data)
  setmost(data)


  a.current[c].calibrated = (data.reading.value - a.mins[c]) / (a.maxs[c] - a.mins[c])
  // console.log(_.map(app.sensordata.mins, i => _.round(i, 3)))
  // console.log(_.map(app.sensordata.maxs, i => _.round(i, 3)))
  // console.log(app.sensordata.maxs)

  var box = document.querySelector(".reading-display#reading" + c)

  box.children[0].innerHTML = "raw: <span class='value'>" + r(data.reading.rawValue) + "</span>"
  box.children[1].innerHTML = "0-1: <span class='value'>" + r(data.reading.value) + "</span>"
  box.children[2].innerHTML = "manually calibrated: <span class='value'>" + r(data.manual_calibrated) + "</span>"
  box.children[3].innerHTML = "auto calibrated:     <span class='value'>" + r(a.current[c].calibrated) + "</span>"

  if (a.current[c].calibrated < app.threshhold) {
    box.setAttribute("style","background-color: rgba(255,0,0,"+ (1-data.manual_calibrated) + ")")
  }
  else box.setAttribute("style","background-color: rgba(255,255,255," + data.manual_calibrated + ")")
  // console.log(reading)


  checklift(c)
  app.sensordata = a
})

function r(i) {
  return _.round(i, 3)
}

function checklift(ch) {
  var a = app.sensordata
  if (a.current[ch].calibrated > app.threshhold && a.previous[ch].calibrated < app.threshhold) {
    console.log(ch + " lifted")
    playmedia(ch)
  }

  else if (a.current[ch].calibrated < app.threshhold) {
    stopmedia(ch)
  }


  a.previous[ch] = a.current[ch]
}

function hi() {
  console.log(Math.random())
}

var playmedia = _.debounce(function(c) {
  console.log("PLAY MEDIA #" + c)

  var count = $(".videowrapper").children().length

  if (count != 0) {

    _(count).times(function(n) {
      stopmedia(n)
    })
    // stopmedia()

    var which = $(".videowrapper").children()[c];
    console.log(which)

    which.play();

    $(which).css({
      "opacity": 1
    })
  }


}, 500)


function stopmedia(ch) {
  var all = $(".videowrapper").children()

  if (all.length != 0) {
    var el = all[ch]
    all[ch].pause()
    all[ch].fastSeek(0)

    $(el).css({
      "opacity": 0
    })
  }
}

function setleast(d) {
  var a = app.sensordata
  if (typeof a.mins[d.chnum] === "undefined") a.mins[d.chnum] = d.reading.value;
  else {
    a.mins[d.chnum] = less(a.mins[d.chnum], d.reading.value)
  }

  function less(current, incoming) {
    return (incoming < current) ? incoming : current
  }
  app.sensordata = a
}
function setmost(d) {
  var a = app.sensordata
  if (typeof a.maxs[d.chnum] === "undefined") a.maxs[d.chnum] = d.reading.value;
  else {
    a.maxs[d.chnum] = more(a.maxs[d.chnum], d.reading.value)
  }


  function more(current, incoming) {
    return (incoming > current) ? incoming : current
  }
  app.sensordata = a
}
