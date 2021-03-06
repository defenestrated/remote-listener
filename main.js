var _ = require('lodash'); // utility
// var $ = require('zepto');

window.app = {
  threshholds: [0.5, 0.5, 0.5, 0.5],
  sensordata: {
    current: [],
    previous: [],
    mins: [0.001, 0.03, 0.001, 0.1],
    maxs: [0.3, 0.3, 0.3, 0.3]
  },
  settings: {
    productionmode: true,
    autocalibrate: false,
    verbose: false,
    debouncetime: 100
  }
}

console.log(app)

document.addEventListener("DOMContentLoaded", function(event) {


  if (app.settings.verbose) console.log("DOM fully loaded and parsed");

  if (app.settings.productionmode === true) {
    $(".readings").addClass("invisible")
    $(".content").addClass("production")
  }

  // if (typeof socket !== "undefined")
    socket.on("setup", function(data) {
      console.log("socket connected!", data)

      if (app.settings.productionmode === false) {
        _(data.openchannels).times(i => {
          var wrapper = document.createElement("div")
          wrapper.classList.add("reading-display")
          wrapper.id = "reading" + i
          _(4).times(i => {
            var dp = document.createElement("div")
            dp.classList.add("data-point")
            wrapper.append(dp)
          })
          $(".readings").append(wrapper)
        })
      }
    })
});

var spitup = _.throttle(function(a) {
      console.log(a)
}, 250)

// if (typeof socket !== "undefined")
  socket.on("reading", function(data) {
    var a = app.sensordata
    var c = data.chnum

    a.current[c] = data.reading

    if (app.settings.autocalibrate === true) {
      setleast(data)
      setmost(data)
    }

    a.current[c].calibrated = (data.reading.value - a.mins[c]) / (a.maxs[c] - a.mins[c])
    // console.log(_.map(app.sensordata.mins, i => _.round(i, 3)))
    // console.log(_.map(app.sensordata.maxs, i => _.round(i, 3)))
    // console.log(app.sensordata.maxs)

    if (app.settings.productionmode === false) {

      var box = document.querySelector(".reading-display#reading" + c)

      box.children[0].innerHTML = "raw: <span class='value'>" + r(data.reading.rawValue) + "</span>"
      box.children[1].innerHTML = "0-1: <span class='value'>" + r(data.reading.value) + "</span>"
      box.children[2].innerHTML = "manually calibrated: <span class='value'>" + r(data.manual_calibrated) + "</span>"
      box.children[3].innerHTML = "auto calibrated:     <span class='value'>" + r(a.current[c].calibrated) + "</span>"

      if (a.current[c].calibrated < app.threshholds[c]) {
        box.setAttribute("style","background-color: rgba(255,0,0,"+ (1-data.manual_calibrated) + ")")
      }
      else box.setAttribute("style","background-color: rgba(255,255,255," + data.manual_calibrated + ")")
      // console.log(reading)

    }


    checklift(c)
    app.sensordata = a
    if (app.settings.verbose) spitup(_.flatMap(a.current, x => (x) ? r(x.value) : 0))
  })

function r(i) {
  return _.round(i, 3)
}

function checklift(ch) {
  var a = app.sensordata
  if (a.current[ch].calibrated > app.threshholds[ch] && a.previous[ch].calibrated < app.threshholds[ch]) {
    console.log(ch + " lifted")
    playmedia(ch)
  }

  else if (a.current[ch].calibrated < app.threshholds[ch]) {
    stopmedia(ch)
  }


  a.previous[ch] = a.current[ch]
}

function hi() {
  console.log(Math.random())
}

var playmedia = _.debounce(function(c) {
  if (app.settings.verbose) console.log("PLAY MEDIA #" + c)

  var count = $(".videowrapper").children().length

  if (count != 0) {

    _(count).times(function(n) {
      stopmedia(n)
    })
    // stopmedia()

    var which = $(".videowrapper").children()[c];
    if (app.settings.verbose) console.log(which)

    which.play();

    $(which).css({
      "opacity": 1
    })
  }


}, app.settings.debouncetime)


function stopmedia(ch) {
  var all = $(".videowrapper").children()

  if (all.length != 0) {
    var el = all[ch]
    all[ch].pause()
    all[ch].currentTime = 0

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
