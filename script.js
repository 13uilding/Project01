import { createMarker, populateMarkers, getLocation } from "./scripts/google";

// HTML Variables
var h1 = $("h1");
var container = $('.container');
var eventForm = $("form")

// Time Variables:
var now;
var nowUTC;
var nowDateTime;
var selectedDate;
var startDate = 0;
var endDate = 0;
var days = [];
for(let i = 1; i < 32; i++){
    var day = i;
    if (i < 10){
        day = "0" + i;
    }
    days.push(String(day));
};
var months = days.slice(0, 12);
var years = [2020, 2021, 2022, 2023, 2024, 2025];

// Ticketmaster Variables
var nextBtn = $("#next");
var prevBtn = $("#prev");
var typeEvent = $("#segment").val();
var price = $("#price").val();
var ticketMasterAPIKey = 'OIxE4IaaAdswnN3Q9eeEnasXqbbJzEnG';
var currentPage = 0;
var size = 10; // 40 results will be created
var storedEvents = {};
var city = "denver";

// Google Variables
var latLng;


// Event Listeners
nextBtn.on("click", function(e){
    e.preventDefault();
    currentPage = pageTurn(1, currentPage);
    // Currently run another

    getEvents(currentPage);

    console.log(currentPage);
})
prevBtn.on("click", function(e){
    e.preventDefault();
    currentPage = pageTurn(-1, currentPage);

    getEvents(currentPage);

    console.log(currentPage);
});

// API
eventForm.on("submit", function(event){
    event.preventDefault();
    storedEvents = {};
    price = $("#price").val();
    queryDate = $("#date").val();
    typeEvent = $("#segment").val();
    currentPage = 0;
    getEvents(currentPage);
});

// Functions
function formOptionFiller(time){
    for(day of days){
        $(`#${time}Day`).append(`<option value=${day}>${day}</option>`);
    };
    for(month of months){
        $(`#${time}Month`).append(`<option value=${month}>${month}</option>`);
    };
    for(year of years){
        $(`#${time}Year`).append(`<option value=${year}>${year}</option>`);
    };

}

function dateFormater(time){
    var day = $(`#${time}Day`).val();
    var month = $(`#${time}Month`).val();
    var year = $(`#${time}Year`).val();
    if (day === "day"){
        day = now.format("DD");
        if (time === "end"){
            day = now.add(1, 'd').format("DD");
        };
    };
    if (month === "month"){
        month = now.format("MM");
    };
    if (year === "year"){
        year = now.format("YYYY");
    };
    var result = year + "-" + month + "-" + day;
    return moment.utc(result).format();
}

function queryURLFiller(typeEvent, startDate, endDate, size, page){
    var queryURL = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${ticketMasterAPIKey}`
    if (typeEvent !== "undefined"){
        queryURL += `&classificationName=${typeEvent}`
    };
    // console.log(startDate);
    // console.log(endDate);
    queryURL += `&startDateTime=${startDate}`; 
    queryURL += `&endDateTime=${endDate}`;
    // console.log(queryURL);
    queryURL += `&size=${size}&page=${page}`;
    queryURL += `&city=${city}`;
    queryURL += `&sort=date,asc`;
    return queryURL;
};

function getEvents(page) {

    $('#events-panel').show();
    $('#attraction-panel').hide();
    // var latlong = position.coords.latitude + "," + position.coords.longitude;
    startDate = dateFormater("start");
    endDate = dateFormater("end");
    queryURL = queryURLFiller(typeEvent, startDate, endDate, size, page);


    $.ajax({
      type: "GET",
      url: queryURL, 
      async: true,
      dataType: "json",
      success: function(json) {
            getEvents.json = json;
            showEvents(json);
      },
      error: function(xhr, status, err) {
            console.log(err);
      }
    });
  }
  
function showEvents(json) {
    var items = $('#events .list-group-item'); // Targeting our HTML
    var events = json._embedded.events; // Events from the call
    // console.log(events);
    container.show();
    var counter = 0
    var queryStart = Object.keys(storedEvents).length;
    for (var i = queryStart; i < queryStart + events.length; i++) {
        var item = items[counter];
        var event = events[i];
        var storedEvent = storedEventsFiller(event);
        // Display
        if (i < items.length){
            renderTile(storedEvent, item);
        };
        $(item).off("click");
        // console.log(event)
        // console.log(event.name)
        storedEvents[i] = storedEvent;
        storedEvents[i].event =  event; // Incase we need more information
        try {
            storedEvents[i].attraction = event._embedded.attractions[0];
        } catch (err) {
            storedEvents[i].attraction = "#";
        }
        try {
            $(item).attr({
                "href": storedEvents[i].attraction.url,
                "target": "_blank",
                "rel": "noopener"
            });
        } catch (err) {
            $(item).attr("href", "#");
            console.log(err);
        }
        storedEvents[i].marker = createMarker(event, "yellow");
        counter++;
    };
    // Hide all the boxes
    while ( counter < items.length ){
        // console.log(counter)
        $(items[counter]).parent().hide();
        counter++;
    }
    populateMarkers(storedEvents);
};

function storedEventsFiller(event){
    var itemHeadingText = event.name;
    var itemDateText = event.dates.start.localDate;
    var itemVenueText = "";
    try {
        itemVenueText = event._embedded.venues[0].name + " in " + event._embedded.venues[0].city.name;
    } catch (err) {
        console.log(err);
    }
    var storedEvent = {
        "heading": itemHeadingText,
        "date": itemDateText,
        "venue": itemVenueText
    };
    return storedEvent;
};

function renderTile(storedEvent, item){
    $(item).children('.list-group-item-heading').text(storedEvent.heading);
    $(item).children('.list-group-item-text').text(storedEvent.date);
    $(item).children('.venue').text(storedEvent.venue);
    $(item).show();
};

function pageTurn(increment, page){
    // Fix this. Make it so the page turn only works when there are events populated
    if (storedEvents[0] === undefined){
        return;
    };
    page += increment;
    if (page < 0) {
        page = Object.keys(storedEvents).length - 1;
        return page;
      }
    if (page > Object.keys(storedEvents).length - 1) {
        page = 0;
    }
    return page;
};


// Initialization
function momentConfig(){
    now = moment();    
    nowUTC = now.utc(String).format();
}

function init(){
    h1.text("Plan a date")
    container.hide();
    momentConfig();
    getLocation();
    formOptionFiller("start");
    formOptionFiller("end");
};

init();