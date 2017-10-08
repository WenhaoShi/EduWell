
let SchoolListJSON = {}

var autocomplete;

function initAutocomplete() {
    // var southWest = new google.maps.LatLng( -39.0777905,148.8913944);
    // var northEast = new google.maps.LatLng( -34.0061134,140.9758421);
    // var vicBounds = new google.maps.LatLngBounds( southWest, northEast )
    autocomplete = new google.maps.places.Autocomplete(
        /** @type {HTMLInputElement} */(document.getElementById('searchbox')),
        {
            types: ['geocode'],
            componentRestrictions: {country: 'AU'}
        });
    google.maps.event.addListener(autocomplete, 'place_changed', function () {
    });
    console.log('Autocomplete Activated')
    document.getElementById('searchbox').placeholder = localStorage[96]
}

//Initalise events
$(document).ready(function() {



    console.log(localStorage)
    console.log('ready')

    //Apply Filter
    $("#searchbox").keyup(function (e) {
        if (e.which == 13) {
            //localeSearch()
            doGeocode()
        }
    });

    //Set Radius to search value
    $("#searchRadius")[0].value = localStorage[56]

    $("#searchRadius").on('keyup mouseup change click', () => {
        if($("#searchRadius")[0].value > 0){
            console.log("radius changed")
            latlon = L.latLng(localStorage[98],localStorage[97])
            localStorage[56] = $("#searchRadius")[0].value
            nearbySchools(latlon)
        }
    })



    //Set checkboxes to search value

    if(localStorage[2] == 1){
        $("#GovernmentCheck")[0].checked = true
    }
    else{
        $("#GovernmentCheck")[0].checked = false
    }
    if(localStorage[3] == 1){
        $("#PrivateCheck")[0].checked = true
    }
    else{
        $("#PrivateCheck")[0].checked = false
    }
    if(localStorage[4] == 1){
        $("#CatholicCheck")[0].checked = true
    }
    else{
        $("#CatholicCheck")[0].checked = false
    }

    if(localStorage[6] == 1){
        $("#LGBTchecked")[0].checked = true
    }
    else{
        $("#LGBTchecked")[0].checked = false
    }
    if(localStorage[8] == 1){
        $("#ASPEchecked")[0].checked = true
    }
    else{
        $("#ASPEchecked")[0].checked = false
    }
    if(localStorage[7] == 1){
        $("#bullyingChecked")[0].checked = true
        $('#BullyRate')[0].style.display = "block"
    }
    else{
        $("#bullyingChecked")[0].checked = false
        $('#BullyRate')[0].style.display = "none"
    }
    if(localStorage[20] == 1){
        $("#NAchecked")[0].checked = true
    }
    else{
        $("#NAchecked")[0].checked = false
    }
    // if(localStorage[21] == 1){
    //     $("#servicesChecked")[0].checked = true
    //     $('#community_services_legend')[0].style.display = "block"
    // }
    // else{
    //     $("#servicesChecked")[0].checked = false
    //     $('#community_services_legend')[0].style.display = "none"
    // }
    if(!$("#GovernmentCheck")[0].checked && !$("#PrivateCheck")[0].checked  && !$("#CatholicCheck")[0].checked  ){
        $("#GovernmentCheck")[0].checked = true
        $("#PrivateCheck")[0].checked = true
        $("#CatholicCheck")[0].checked = true
    }
    if(localStorage[60] == undefined || localStorage[60] == null){
        localStorage[60] = ""
    }

    //Check favbox
    $(document).on('change', 'input[type="checkbox"]', function(e){
        $(".favcheck").click(shortlist(e.target.id))
    });

    //Fix easyautocomplete style issue
    $('div.easy-autocomplete').removeAttr('style');

    initAutocomplete()
    service = new google.maps.places.PlacesService(document.getElementById('map'))

    //Apply initial filters
    $(document).on( "load", function() {
        $("#filterApply").click(filterMap(mymap))
        window.onerror(function (error) {
            console.log(error)
        })

        //Read School Data
        $.get('connecttest.php', function(json) {
            console.log( "adbg;asbd");
            SchoolListJSON = JSON.parse(json)
        }).fail(function( jqxhr, textStatus, error ) {
            //On failure read from local file
            var err = textStatus + ", " + error;
            console.log( "Request Failed: " + err );
            console.log('Loading data from local JSON')
            $.getJSON("data/schoolList.json", function(json) {
                SchoolListJSON = json
            })
        });

    })

});

//Read School Data
$.getJSON("data/schoolList.json", function(json) {
    SchoolListJSON = json
}).done(() => {

    $.get('connecttest.php', function (json) {
        console.log("adbg;asbd");
        SchoolListJSON = JSON.parse(json)
        SchoolListJSON.pop()
    }).fail(function (jqxhr, textStatus, error) {
        //On failure read from local file
        var err = textStatus + ", " + error;
        console.log("Request Failed: " + err);
        console.log('Loading data from local JSON')
        $.getJSON("data/schoolList.json", function (json) {
            SchoolListJSON = json
        })
    })

    //Initialise map and search
    mymap = buildMap()

})
//Establish leaflet map
    let mymap = L.map('mapid', {
        loadingControl: true
    })
    mymap.zoomControl.setPosition('bottomright');

//Build leaflet map
    function buildMap(oldloc, zoom, repeat) {

        //Get initial latlon

        if (localStorage[60] != "") {
            Storage = localStorage[60].split(',')
        }
        let latlon = L.latLng()

        if (localStorage[98] == "undefined" || localStorage[98] == "undefined") {
            latlon = L.latLng([-37.814, 144.96332])
        } else {
            latlon = L.latLng(localStorage[98], localStorage[97])
        }

        //Generate nearby schools based on initial map value
        let searchMarker = new L.marker()
        searchMarker = L.marker(latlon).addTo(mymap);
        searchMarker.bindPopup(localStorage[96])
        searchMarker.id = localStorage[96]
        searchMarker.on('click', clickMarker)


        // $('#nearby_schools')[0].style.top = "5px"
        $("#nearby_schools_to")[0].innerHTML = "Schools nearby <i>" + localStorage[96] + "</i>"
        nearbySchools(latlon)

        if (repeat) {
            mymap.setView(oldloc, zoom);
        }
        else {
            mymap.setView(latlon, 15)
        }
        // Load tiles
        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox.streets',
            accessToken: 'pk.eyJ1Ijoiam9zenRyZWljaGVyIiwiYSI6ImNqNmJicmxtczE3ZnUydnFybWl4am94bnAifQ.AqK2Zt30_RpbcPHLatRS2A'
        }).addTo(mymap);

        //Add locate user function
        var lc = L.control.locate({
            position: 'bottomright',
            drawCircle: false,
            markerClass: L.marker,
            strings: {
                title: "Use current location",
                popup: "Your current location"
            }
        }).addTo(mymap);

        //Locate user event
        mymap.on('locationfound', (e) => {
            console.log(e)
            nearbySchools(e.latlng)
            $("#nearby_schools_to")[0].innerHTML = "Schools near you";
            $('#nearby_schools')[0].style.top = "5px"
            document.getElementById('searchbox').placeholder = "Enter a location"
            localStorage[96] = "You"
            localStorage[97] = e.longitude
            localStorage[98] = e.latitude
        })


        //If stats enabled get LGA

        if (localStorage[7] == 1) {
            console.log('agklsb')
            mymap.spin(true)
            loadGeoJSON(mymap)
            // $("#mapwrapper").load();
            $('#BullyRate')[0].style.display = "block"
        }
        else {
            console.log('GeoJSON disabled')
            mymap.spin(false)
            $('#BullyRate')[0].style.display = "none"
        }

        //Get school data and generate markers
        getSchoolList(mymap)
        return mymap
    }

//Load LGA
    function loadGeoJSON(map) {

        let LGA = new L.geoJson();
        LGA.setStyle({fillColor: 'red'})

        //Get GeoJSON data on LGAs
        // if (document.getElementById("bullyingChecked").checked) {
        $.getJSON("data/LGA_geojson.GeoJSON", function (data) {
            //Bind LGA to map
            $(data.features).each(function (key, data) {
                LGA.addData(data);
            })

            //Colour LGA by bullying rate
            if (document.getElementById("bullyingChecked").checked) {
                bullyingColor(LGA)
            }
        }).done(() => {
            LGA.addTo(map)
            mymap.spin(false)
            console.log('print after LGA')

        })
        // }else{
        mymap.spin(false)
        // }

    }

//Colour LGA by bullying rate
    function bullyingColor(GeoJSON) {
        GeoJSON.setStyle({fillColor: 'red'})
        GeoJSON.eachLayer(function (layer) {
            layer.setStyle({fillColor: getColor(layer.feature.properties.Indicator)})
                .bindPopup("<b>" + layer.feature.properties.LGA + "<br>Bullying rate: </b><span style='color: " + getColor(layer.feature.properties.Indicator) +
                    "'>" + layer.feature.properties.Indicator + "% </span>")
        })
    }


// get color depending on bulling proportion value
    function getColor(d) {
        if (d < 12.5) {
            return '#34ff00'
        }
        else if (d >= 12.5 && d < 17.5) {
            return '#fdff00'
        }
        else {
            return '#ff001b'
        }
    }


//Get school and add marker
    function getSchoolList(map) {
        // let SchoolListJSON = {}

        addSchoolMarkers(SchoolListJSON, map)
        // function getFromLocal() {
        //     $.getJSON("data/schoolList.json", function (json) {
        //         SchoolListJSON = json
        //     }).done(() => {
        //         addSchoolMarkers(SchoolListJSON, map)
        //     })
        // }
        //
        // $.get('connecttest.php', function (json) {
        //     console.log("adbg;asbd");
        //     try {
        //         SchoolListJSON = JSON.parse(json)
        //     } catch (err) {
        //         getFromLocal()
        //     }
        // }).fail(function (jqxhr, textStatus, error) {
        //     //On failure read from local file
        //     var err = textStatus + ", " + error;
        //     console.log("Request Failed: " + err);
        //     console.log('Loading data from local JSON')
        //     getFromLocal()
        // });
        //
        // function getFromLocal() {
        //     $.getJSON("data/schoolList.json", function (json) {
        //         SchoolListJSON = json
        //     }).done(() => {
        //         addSchoolMarkers(SchoolListJSON, map)
        //     })
        // }


    }

//Get JSON from local on server fail


//Add marker
    function addSchoolMarkers(data, map) {


        var markers = L.markerClusterGroup({
            animateAddingMarkers: true,
            removeOutsideVisibleBounds: true,
            disableClusteringAtZoom: 15
        });
        var markersList = [];

        let addmarker = (data) => {
            let icon = getIcon(data)
            let latlon = L.latLng(data.Latitude, data.Longitude)
            var marker = L.marker(latlon, {icon: icon})
            marker.properties = data
            marker.on('click', clickSchool)
            markersList.push(marker)
            markers.addLayer(marker)
        }

        //Only add primary schools
        for (i = 0; i < data.length; i++) {
            if (data[i].Type.includes("Pri")) {
                if (sectorEnabled(data[i])) {
                    if (data[i].LGBT == "Y" && localStorage[6] == 1) {
                        addmarker(data[i])
                    }
                    if (data[i].AS_Phys && localStorage[8] == 1) {
                        addmarker(data[i])
                    }
                    if (!data[i].AS_Phys && data[i].LGBT == "N" && localStorage[20] == 1) {
                        addmarker(data[i])
                    }
                }
            }
        }

        map.addLayer(markers)

    }

//Define marker
    let getIcon = (data) => {

        if (localStorage[6] == 1 && (data.LGBT == "Y")) { //LGBT badge
            switch (data.Sector) {
                case "Government":
                    var icon = L.icon({
                        iconUrl: "http://35.189.25.144/EduWell/icons/icons8-Govt2-LGBT.png"
                    })
                    break
                case "Independent":
                    var icon = L.icon({
                        iconUrl: "http://35.189.25.144/EduWell/icons/icons8-Private-LGBT.png"
                    })
                    break
                case "Catholic":
                    var icon = L.icon({
                        iconUrl: "http://35.189.25.144/EduWell/icons/icons8-Catholic-LGBT.png"
                    })
                    break
                default:
                    var icon = L.icon({
                        iconUrl: "http://35.189.25.144/EduWell/icons/icons8-Govt-LGBT.png"
                    })
            }
        }
        else if (localStorage[8] == 1 && (data.AS_Phys)) { //After School Phys Ed
            switch (data.Sector) {
                case "Government":
                    var icon = L.icon({
                        iconUrl: "http://35.189.25.144/EduWell/icons/icons8-Govt-ASPE.png"
                    })
                    break
                case "Independent":
                    var icon = L.icon({
                        iconUrl: "http://35.189.25.144/EduWell/icons/icons8-Private-ASPE.png"
                    })
                    break
                case "Catholic":
                    var icon = L.icon({
                        iconUrl: "http://35.189.25.144/EduWell/icons/icons8-Catholic-ASPE.png"
                    })
                    break
                default:
                    var icon = L.icon({
                        iconUrl: "icons/icons8-Govt.png"
                    })
            }
        } else {
            switch (data.Sector) { //Default Badge
                case "Government":
                    var icon = L.icon({
                        iconUrl: "http://35.189.25.144/EduWell/icons/icons8-Govt2.png"
                    })
                    break
                case "Independent":
                    var icon = L.icon({
                        iconUrl: "http://35.189.25.144/EduWell/icons/icons8-Private.png"
                    })
                    break
                case "Catholic":
                    var icon = L.icon({
                        iconUrl: "http://35.189.25.144/EduWell/icons/icons8-Catholic.png"
                    })
                    break
                default:
                    var icon = L.icon({
                        iconUrl: "http://35.189.25.144/EduWell/icons/icons8-Govt.png"
                    })
            }
        }

        icon.options.iconSize = [data.total_scaled, data.total_scaled]; //Size by students enrolled
        icon.options.className = "leafletIcon";
        return icon
    }

// //Configure easy complete search bar
// function defineSearch(){
//     var options = {
//         url: "data/localities.json",
//
//         getValue: "SearchName",
//
//         list: {
//             match: {
//                 enabled: true
//             }
//         }
//     };
//
//     $("#searchbox").easyAutocomplete(options);
// }


// defineSearch()


//Click school event get school info
    function clickSchool(e) {


        //Get properties
        let props = e;
        if (!(props.target == undefined || props.target == null )) {
            props = e.target.properties
        }


        //Mark as selected
        // let selected = new L.icon({iconUrl: 'icons/icons8-Checkmark-48.png'})

        let checkbox = ""

        //Generate appropriate checkbox
        if (inShortList(props.School_Id)) {
            // shortlist(props.School_Id)
            checkbox = "<input class='favcheck' type='checkbox' id='" +
                props.School_Id + "'checked>"
        } else {
            checkbox = "<input class='favcheck' type='checkbox' id='" +
                props.School_Id + "'>"
        }

        document.getElementById("selectedSchool").style.height = "auto";

        let Address = props.Address1
            + props.Address2 + ", " +
            props.Town + " " + props.PPostcode

        let streetView_imgURL = ""
        streetView_imgURL = encodeURI(("https://maps.googleapis.com/maps/api/streetview?size=600x300&location=" +
            props.School_Name.replace("'", "") + "," + Address + "&key=AIzaSyDL8mL_M5dy0iux97ExLt8gRrj_NNtbmII"));


        //Get Website
        let request = {
            location: {lat: props.Latitude, lng: props.Longitude},
            radius: '500',
            keyword: [(props.School_Name + "," + Address)]
        }

        let website = ""

        let service = new google.maps.places.PlacesService(document.getElementById('map'))

        service.nearbySearch(request, (results) => {
            placeId = results[0].place_id

            service.getDetails({
                placeId: placeId
            }, (details) => {
                website = details.website
                addDetails()
                $('#nearby_schools')[0].style.top = "100%"
                $("#nearby_schools_to")[0].innerHTML = "<button class='panebutton' id='back' onclick='nearbycollapse()'>&#9652; Back to school details &#9652;  </button>" +
                    "Schools nearby <i>" + props.School_Name + "</i>"
                nearbySchools(L.latLng(props.Latitude, props.Longitude))
                // nearbyServices(props)
            })
        })


        //set school type icon
        function addDetails() {
            let schoolType_icon = ""
            if (props.Sector == "Government") {
                schoolType_icon = "<img src='http://35.189.25.144/EduWell/icons/icons8-Govt2.png' style='height: 20px'>"
            }
            if (props.Sector == "Catholic") {
                schoolType_icon = "<img src='http://35.189.25.144/EduWell/icons/icons8-Catholic.png' style='height: 20px'>"
            }
            if (props.Sector == "Independent") {
                schoolType_icon = "<img src='http://35.189.25.144/EduWell/icons/icons8-Private.png' style='height: 20px'>"
            }

            let classSize = "Not Available"
            if (props.AverageClassSize !== undefined && props.AverageClassSize !== null) {
                classSize = parseInt(props.AverageClassSize) + " students"
            }

            let programs = ""
            if (isNone(props)) {
                programs = ""
            } else {
                programs = "<h4>Special Programs:</h4>" + isLGBT(props) + isASPE(props)
            }

            console.log(props)
            document.getElementById("selectedSchool").innerHTML = (props ?
                "<div class='detailsPane1'>" +
                "<img style='width:100%;' id='streetviewImg' src='"
                + streetView_imgURL + "'>" +
                "<span id='streetviewInfo'>click image for streetview</span><div class='favbox'><span class='addShortList'>Add to short list</span>" + checkbox + "</div>" +
                '<h3>' + props.School_Name + '</h3>' +
                "<div style='text-align:center'><i>" + Address + "</i>"
                + '<br>' + props.Phone + "<br>"
                + "<a class='smalllink' href='" + website + "'>" + website + "</a></div>"
                + "<br><b>School Type: </b>" + schoolType_icon + " " + props.Sector
                + "<br><b>Students enrolled: </b>" + parseInt(props.Total) + "<br>" +
                "<b>Average Class Size: </b>" + classSize + "<br>" +
                "<b>Buildings: </b>" + getBuildings(props) + "<br>" +
                "<b>Total building area: </b>" + getFloorArea(props) + "<br>"
                + "<b>Average Annual Investment: </b> " + getInvest(props) + "<br>"
                + "<h4>Special Programs:</h4>" + isLGBT(props) + isASPE(props) + isNone(props) +
                "<div class='floatingbottombutton'>" +
                "<button class='panebutton2' id='show_nearby_schools' onclick='showNearbySchools()'>&#9662; nearby schools &#9662;</button>" +
                "<button class='panebutton panebutton-react grey' id='show_nearby_services' onclick='showNearbyServices()'>&#9662; nearby community services &#9662;</button>"
                : '<h4>Click a school to see info</h4>')

            console.log(props)
            $("#show_nearby_services").on("click", nearbyServices(props))


            //Find nearby schools to clicked school
            // $("#showSchoolBlock").animate({scrollTop: 0}, 100);

            //Streetview event


            $('#streetviewImg').click(function () {

                console.log("click")
                modal.style.display = "block";
                modalImg.src = this.src;
                captionText.innerHTML = this.alt;
                console.log("click")
            })

            $('#streetviewInfo').click(function () {

                console.log("click")
                modal.style.display = "block";
                modalImg.src = this.src;
                captionText.innerHTML = this.alt;
                console.log("click")
            })
        }

        // Geocode the address
        let geocoder = new google.maps.Geocoder();
        try {
            geocoder.geocode({
                'address': (props.School_Name + "," + Address),
                region: 'VIC, Aus',
                componentRestrictions: {country: 'AU'}
            }, (results, status) => {
                if (status === google.maps.GeocoderStatus.OK && results.length > 0) {
                    try {
                        initializeStreetView(results[0].geometry.location.lat(), results[0].geometry.location.lng())
                    } catch (err) {
                        $('#streetviewImg')[0].src = streetView_imgURL
                    }
                }
                else {
                    try {
                        initializeStreetView(props.Latitude, props.Longitude)
                    } catch (err) {
                        $('#streetviewImg')[0].src = streetView_imgURL
                    }
                }
            })
        } catch (err) {
            $('#streetviewImg')[0].src = streetView_imgURL;
        }

        //Nearby Services
        // if(localStorage[21] == 1){
        //     nearbyServices(props)
        // }

    }

//Click school event get school info
    function clickMarker(e) {

        //Get properties
        let Id = e.target.id;

        //Mark as selected
        let checkbox = ""

        // document.getElementById("selectedSchool").style.height = "150px";

        // document.getElementById("selectedSchool").innerHTML = "<h3>" + Id + "</h3>"
        $("#nearby_schools_to")[0].innerHTML = "Schools nearby " + "<i>" + e.target.id + "</i>"
        $('#nearby_schools')[0].style.top = "5px"

        //Find nearby schools to clicked school
        // nearbySchools(L.latLng(props.Latitude, props.Longitude))
    }


//Find nearby schools to specified area
    function nearbySchools(latlon) {
        console.log(latlon)
        let area = latlon //Area from which nearby schools is measured
        let threshold = localStorage[56] * 1000 //Threshold for distance to travel
        //default to 3000 if invalid
        if (threshold == undefined || threshold < 1000 || threshold > 10000) {
            threshold = 3000
        }
        let nearbySchools = []
        // $.getJSON("data/schoolList.json", function (json) {
        //     return json
        // }).then((json) => {
        //     console.log(SchoolListJSON)
            SchoolListJSON.map((item) => {
                // console.log(item)
                let schoolLoc = L.latLng(item.Latitude, item.Longitude)
                let distance = area.distanceTo(schoolLoc)
                if (distance < threshold && distance > 0) {

                    item.distance = distance
                    if (sectorEnabled(item) && programEnabled(item)) {
                        nearbySchools.push(item)
                    }
                }
            })

            nearbySchools.sort(function (a, b) {
                return parseFloat(a.distance) - parseFloat(b.distance);
            });
            document.getElementById('schoolDisplay').innerHTML = ""
            nearbySchools.map((school) => {

                let schoolData = school
                let checkbox = ""
                //Check if school is in shortlist
                if (inShortList(school.School_Id)) {
                    checkbox = "<input class='favcheck' type='checkbox' id='" +
                        school.School_Id + "'checked>"
                } else {
                    checkbox = "<input class='favcheck' type='checkbox' id='" +
                        school.School_Id + "'>"
                }

                //Define icon
                let schoolType_icon = ""
                if (school.Sector == "Government") {
                    schoolType_icon = "<img src='http://35.189.25.144/EduWell/icons/icons8-Govt2.png' style='height: 20px'>"
                }
                if (school.Sector == "Catholic") {
                    schoolType_icon = "<img src='http://35.189.25.144/EduWell/icons/icons8-Catholic.png' style='height: 20px'>"
                }
                if (school.Sector == "Independent") {
                    schoolType_icon = "<img src='http://35.189.25.144/EduWell/icons/icons8-Private.png' style='height: 20px'>"
                }


                document.getElementById('schoolDisplay').innerHTML += "<div class='schoolListEntry' id='" + school.School_Id + "'> " +
                    "<div class='favbox'><span class='addShortList'>Add to shortlist</span>" + checkbox + "</div>" +
                    "<div class='schoolListEntry1' id='" + school.School_Id + "'> " +
                    " <h4 id=" + school.School_Id + ">"
                    + school.School_Name + "</h4>" +
                    '<span id=\'info\'><i>' + school.Address1
                    + school.Address2 + ", " +
                    school.Town + " " + school.PPostcode
                    + "</i><br><br><b>Distance: </b>" + (school.distance / 1000).toFixed(2) + "km"
                    + "<br><b>School Type: </b>" + schoolType_icon + school.Sector
                    + "</span></div>";


                // $("#" + school.School_Id)[0].data = school.Latitude
                // $("#" + school.School_Id).data += school.Longitude


                //Focus school on click
                $(".schoolListEntry").hover(function (e) {
                    hoverNearbySchool(e)
                })

                $(".schoolListEntry1").click(function (e) {
                    clickNearbySchool(e)
                })
            })
        // })
    }


//Activate Search
    let searchMarker = new L.marker()


//Run filters
    function filterMap(map) {
        let error = document.getElementById("error")
        let govt = document.getElementById("GovernmentCheck").checked
        let independent = document.getElementById("PrivateCheck").checked
        let catholic = document.getElementById("CatholicCheck").checked
        let LGBT = document.getElementById("LGBTchecked").checked
        let ASPE = document.getElementById("ASPEchecked").checked
        let noSpecial = document.getElementById("NAchecked").checked
        let Bullying = document.getElementById("bullyingChecked").checked
        // let comm_services = document.getElementById("servicesChecked").checked


        error.innerHTML = ""

        if (!govt && !independent && !catholic) {
            console.log("Click a school")
            error.innerHTML = "Please select at least one school type"
        }
        else {
            if (govt) {
                localStorage[2] = 1
            }
            else {
                localStorage[2] = 0
            }
            if (independent) {
                localStorage[3] = 1
            } else {
                localStorage[3] = 0
            }
            if (catholic) {
                localStorage[4] = 1
            }
            else {
                localStorage[4] = 0
            }
            if (LGBT) {
                localStorage[6] = 1
            }
            else {
                localStorage[6] = 0
            }
            if (ASPE) {
                localStorage[8] = 1
            }
            else {
                localStorage[8] = 0
            }
            if (noSpecial) {
                localStorage[20] = 1
            }
            else {
                localStorage[20] = 0
            }
            if (Bullying) {
                localStorage[7] = 1
            }
            else {
                localStorage[7] = 0
            }
            // if(comm_services){
            //     $('#community_services_legend')[0].style.display = "block"
            //     localStorage[21] = 1
            // }else{
            //     localStorage[21] = 0
            //     $('#community_services_legend')[0].style.display = "none"
            // }
            let latlng = mymap.getCenter()
            let zoom = mymap.getZoom()
            // mymap.eachLayer(function (layer) {
            //     mymap.removeLayer(layer);
            // });


            localStorage[60] = Shortlist

            // buildMap(latlng, zoom, true)
            window.location.reload()

        }
    }

//Filter Checks

    function sectorEnabled(item) {
        if (item.Sector == "Government" && document.getElementById("GovernmentCheck").checked) {
            return true
        }
        else if (item.Sector == "Independent" && document.getElementById("PrivateCheck").checked) {
            return true
        }
        else if (item.Sector == "Catholic" && document.getElementById("CatholicCheck").checked) {
            return true
        }
        else {
            false
        }
    }

function programEnabled(item) {
    if (item.AS_Phys && $("#ASPEchecked")[0].checked) {
        return true
    }
    else if (item.LGBT == "Y" && $("#LGBTchecked")[0].checked) {
        return true
    }
    else if (!(item.AS_Phys || item.LGBT == "Y") && document.getElementById("NAchecked").checked) {
        return true
    }
    else {
        false
    }
}

    function getInvest(props) {
        if (parseInt(props.Investment) > 1) {
            return "$" + props.Investment
        }
        else {
            return "Not Available"
        }
    }

    function getBuildings(props) {
        if (props.BuildingNumber > 1) {
            return parseInt(props.BuildingNumber)
        }
        else {
            return "Not Available"
        }
    }

    function getFloorArea(props) {
        if (props.FloorArea > 1) {
            return parseInt(props.FloorArea) + "m<sup>2</sup>"
        }
        else {
            return "Not Available"
        }
    }

    let isLGBT = (props) => {
        if (props.LGBT == "Y") {
            return "<img src='http://35.189.25.144/EduWell/icons/icons8-LGBT%20Flag-48.png' height='30'> Safe Schools (LGBTA support) <br>";
        }
        else {
            return ""
        }
    }

    function isASPE(props) {
        if (props.AS_Phys) {
            return "<img src='http://35.189.25.144/EduWell/icons/icons8-Exercise-48.png' height='30'> After-school Physical Activity <br>";
        } else {
            return ""
        }

    }

    function isNone(props) {
        if ((props.LGBT == "N") && !(props.AS_Phys)) {
            return "None Available"
        } else {
            return ""
        }
    }

//Shortlist WILL REPLACE FAV LIST

    let Shortlist = []
    if (localStorage[60] !== "") {
        Shortlist = localStorage[60].split(',')
    }
    let favNum = Shortlist.length
    document.getElementById('numToCompare').innerHTML = favNum;

    function shortlist(schoolID) {

        n = schoolID.toLowerCase().indexOf("check")
        //Add or remove shortlist

        if (n < 0) {
            if (!inShortList(schoolID)) {
                Shortlist.push(schoolID)
            }
            else {
                removeShortList(schoolID)
            }

            //Define selected schools list
            let favNum = Shortlist.length
            document.getElementById('numToCompare').innerHTML = favNum;
            // document.getElementById('selectedSchools').innerHTML = "";

            let favNames = []
            Shortlist.map((e) => {
                SchoolListJSON.map((school) => {
                        if (school.School_Id == e) {
                            favNames.push(school.School_Name)
                        }
                        return (favNames)
                    })
                    return (favNames)
                }).then(() => {
                    document.getElementById('selectedSchools').innerHTML = "";
                    for (i = 0; i < favNames.length; i++) {
                        document.getElementById('selectedSchools').innerHTML += "<li>" + favNames[i] + "</li>";
                    }
                })
            localStorage[60] = Shortlist
        }
    }

    function shortlistDelete() {
        Shortlist = []
        document.getElementById('numToCompare').innerHTML = 0;
        let favs = $(".favcheck")
        for (let i = 0; i < favs.length; i++) {
            console.log(favs[i])
            favs[i].checked = false

        }
        localStorage[60] = ""
    }

//Fetch IDs for schools in which compare is checked
    function compare() {

        if (Shortlist.length < 2) {
            $("#compare_error")[0].innerHTML = "Select at least 2 schools to compare"
        }
        else {
            localStorage[100] = Shortlist.length
            for (i in Shortlist) {
                localStorage[i] = Shortlist[i]
            }
            localStorage[60] = Shortlist
            localStorage[61] =
                window.location.href = 'comparison.html';
            return Shortlist
        }
    }

    function inShortList(schoolID) {
        let x = 0

        if (Shortlist.length > 0) {
            for (let i = 0; i < Shortlist.length; i++) {
                if (Shortlist[i] == schoolID) {
                    x += 1
                }
            }
            if (x > 0) {
                return true
            }
            else {
                return false
            }
        }
        else {
            console.log('Shortlist Empty')
            return false
        }
        console.log(x)
    }

    function removeShortList(SchoolID) {
        $('#' + SchoolID)[0].checked = false
        Shortlist = Shortlist.filter(function (item) {
            return item !== SchoolID
        })
    }




    function doGeocode() {
        var addr = document.getElementById("searchbox");
        localStorage[96] = addr.value;
        // Get geocoder instance
        var geocoder = new google.maps.Geocoder();

        // Geocode the address
        geocoder.geocode({
            'address': addr.value,
            region: 'VIC, Aus',
            componentRestrictions: {country: 'AU'}
        }, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK && results.length > 0) {

                // set it to the correct, formatted address if it's valid
                // addr.value = results[0].formatted_address;;

                lat = results[0].geometry.location.lat()
                lon = results[0].geometry.location.lng()

                //Set bounds to victoria
                if (lon > 150.718821 || lon < 140.6568968 || lat > -33.8030981 || lat < -39.0317517) {
                    console.log("Invalid Query")
                    document.getElementById('searcherror').innerHTML = "Please enter a valid location"
                    return
                } else {
                    document.getElementById('searcherror').innerHTML = ""
                    console.log("Valid Query")
                    console.log('search success')
                    let searchLocale2 = L.latLng(lat, lon)
                    localStorage[56] = $("#searchRadius")[0].value
                    searchMarker = L.marker(searchLocale2).addTo(mymap);
                    searchMarker.bindPopup(addr.value)
                    document.getElementById("selectedSchool").style.height = "15%";
                    document.getElementById("schoolDisplay").style.height = "85%";
                    document.getElementById("selectedSchool").innerHTML = '<h3>' + addr.value + '</h3>'
                    mymap.setView(searchLocale2, 15);
                    $("#nearby_schools_to")[0].innerHTML = "Schools nearby <i>" + addr.value + "</i>"
                    nearbySchools(searchLocale2)
                    $('#nearby_schools')[0].style.top = "5px"
                    localStorage[98] = lat
                    localStorage[97] = lon
                }


                //https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=YOUR_API_KEY
                // show an error if it's not
            } else {
                document.getElementById('searcherror').innerHTML = "Please enter a valid locality"
                console.log("Invalid Query")
            }
        });
    };

    function clickNearbySchool(e) {
        let id = e.currentTarget.id
        // $.getJSON("data/schoolList.json", function (json) {
            school = SchoolListJSON.filter((data) => {
                return data.School_Id == id
            })
            let latlon = L.latLng(school[0].Latitude, school[0].Longitude)
            mymap.setView(latlon, 15)

            mymap.eachLayer((layer) => {
                if (!(layer.properties == undefined || layer.properties == null)) {

                    // console.log(layer.properties.School_Id)
                    if (layer.properties.School_Id == id) {
                        let latlon = L.latLng(layer.properties.Latitude, layer.properties.Longitude)
                        mymap.setView(latlon, 15)
                        layer._icon.focus()
                        clickSchool(layer.properties)
                        $("#showSchoolBlock").animate({scrollTop: 0}, 100);
                        return
                    }
                }

            })
        // })
    }

    function hoverNearbySchool(e) {
        let id = e.currentTarget.id

        mymap.eachLayer((layer) => {
            if (!(layer.properties == undefined || layer.properties == null)) {

                // console.log(layer.properties.School_Id)
                if (layer.properties.School_Id == id) {
                    layer._icon.focus()
                    return
                }
            }

        })
    }


    mymap.spin(false)


/// Ziyans Streetview Modal

    var modal = document.getElementById('myModal');

    var img = document.getElementById('streetviewImg');
    var modalImg = document.getElementById("pano");
    var captionText = document.getElementById("caption");

// img.onclick = function(){
//     modal.style.display = "block";
//     modalImg.src = this.src;
//     captionText.innerHTML = this.alt;
// }

// get <span> ,set close button
    var span = document.getElementsByClassName("close")[0];

// when clicj(x), close window
    span.onclick = function () {
        modal.style.display = "none";
    }

//Exit modal on outside click
    $('#modalback').click(() => {
        modal.style.display = "none";

    })

    function initializeStreetView(lat, lon) {
        document.getElementById('pano').innerHTML = " "
        var latlon = {lat: lat, lng: lon};
        var map = new google.maps.Map(document.getElementById('map'), {
            center: latlon,
            zoom: 14
        });
        var panorama = new google.maps.StreetViewPanorama(
            document.getElementById('pano'), {
                position: latlon,
                // pov: {
                //     heading: 34,
                //     pitch: 10
                // },
                source: google.maps.StreetViewSource.OUTDOOR
            });
        map.setStreetView(panorama);
    }

    function nearbyServices(school) {
        console.log(school)

        $("#nearby_services")[0].innerHTML = "<br><button class='panebutton' id='back' onclick='nearbycollapseServices()'>&#9652; Back to school details &#9652;  </button>" +
            "Community Services near <i>" + school.School_Name + ":</i><br><br>";

        customRemoveLayer("nearby_service")
        // $.getJSON("data/schoolList.json", function (json) {
            SchoolListJSON.map((d) => {
                if (d.School_Id == school.School_Id) {
                    console.log(school)
                    fetchServices(school, "after school care")
                    fetchServices(school, "child community services")
                    fetchServices(school, "community sports club")
                }
            })
        // })

        // fetchServices(school, "doctors")
    }

    function fetchServices(school, query, icon) {

        var markers = L.layerGroup({
            animateAddingMarkers: true,
            removeOutsideVisibleBounds: true,
            disableClusteringAtZoom: 15
        });

        let request = {
            location: {lat: school.Latitude, lng: school.Longitude},
            radius: '1000',
            keyword: [query]

        }
        service.nearbySearch(request, (results) => {
            results.map((d) => {
                // if(!(d.types.includes('school'))){
                //     addmarker(d)
                // }

                $('#nearby_services')[0].innerHTML += d.name + "<br><i>" + d.vicinity + "</i><br><br>";
                console.log(d);
            })
        })


        // let addmarker = (data) => {
        //     if(query == "community sports club"){
        //         data.icon = "http://35.189.25.144/EduWell/icons/icons8-Dumbbell-48.png"
        //     }
        //     let icon = L.icon({
        //         iconUrl: data.icon,
        //         iconSize: [30,30]
        //     })
        //     let latlon = L.latLng(data.geometry.location.lat(), data.geometry.location.lng())
        //     let marker = L.marker(latlon, {icon: icon})
        //     marker.id = "nearby_service"
        //     marker.bindTooltip(data.name)
        //     markers.addLayer(marker)
        // }
        // markers.addTo(mymap)
        return markers
    }


// GetLayer function Leaflet

    function customRemoveLayer(id) {
        mymap.eachLayer((layer) => {
            if (layer.id == id) {
                mymap.removeLayer(layer)
            }
        })
    }

    function showNearbySchools() {
        $('#nearby_schools')[0].style.top = "5px"
    }

    function nearbycollapse() {
        $('#nearby_schools')[0].style.top = "100%"
    }

    function populateShortlist() {
        console.log(Shortlist)
        $('#SchoolListDropdown')[0].innerHTML = ""
        // $.getJSON("data/schoolList.json", function (json) {
            SchoolListJSON.map((d) => {
                if (inShortList(d.School_Id)) {
                    $('#SchoolListDropdown')[0].innerHTML += "<li>" + d.School_Name + "</li>"
                    console.log(d.School_Name)
                }
            })
        // })

    }

    function showNearbyServices() {
        $('#nearby_services')[0].style.top = "5px"
    }

    function nearbycollapseServices() {
        $('#nearby_services')[0].style.top = "100%"
    }

