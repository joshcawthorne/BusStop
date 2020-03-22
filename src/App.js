import React, { Component } from "react";
import "./App.css";
import Location from "./Location";

const geoLocationOptions = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
};

const app_id = "f310fe7a";
const app_key = "592a92cc0b58c9e84abd7140d21f4a2f";

//const leedsLat = "53.798482";
//const leedsLong = "-1.5447389";

const leedsLat = "51.5207328";
const leedsLong = "-0.1049744";

let location_timeout;

export class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      latitude: null,
      longitude: null,
      error: false,
      errorMsg: "",
      gettingLocation: false,
      gotLocation: false,
      gotStops: false,
      busStops: null,
      getStopData: false,
      depatures: null
    };
  }

  handleLocation = data => {
    console.log(data);
  };

  handleGeoSuccess = position => {
    var lat = position.coords.latitude;
    var lng = position.coords.longitude;
    clearTimeout(location_timeout);
    console.log(lat, lng);
    this.setState(
      {
        latitude: lat,
        longitude: lng,
        gotLocation: true
      },
      () => {
        this.getBusTimes();
      }
    );
  };

  handleGeoError = error => {
    console.log("Error");
    console.log(error);
  };

  geolocFail = error => {
    console.log("error", error);
  };

  getLocation = () => {
    this.setState({
      gettingLocation: true
    });
    if (navigator.geolocation) {
      location_timeout = setTimeout(() => this.geolocFail("Timed Out"), 10000);
      navigator.geolocation.getCurrentPosition(
        this.handleGeoSuccess,
        this.handleGeoError
      );
    } else {
      // Fallback for no geolocation
      console.log("Error");
    }
  };

  getBusTimes = () => {
    let apiURL =
      "https://transportapi.com/v3/uk/places.json?lat=" +
      leedsLat +
      "&lon=" +
      leedsLong +
      "&type=bus_stop&app_id=" +
      app_id +
      "&app_key=" +
      app_key;
    console.log(apiURL);
    fetch(apiURL)
      .then(data => data.json())
      .then(dataJson =>
        this.setState({
          gotStops: true,
          busStops: dataJson.member
        })
      );
  };

  getLeedsBusTimes = () => {
    let apiURL =
      "https://transportapi.com/v3/uk/places.json?lat=" +
      leedsLat +
      "&lon=" +
      leedsLong +
      "&type=bus_stop&app_id=" +
      app_id +
      "&app_key=" +
      app_key;
    console.log(apiURL);
    fetch(apiURL)
      .then(data => data.json())
      .then(dataJson =>
        this.setState({
          gotStops: true,
          busStops: dataJson.member
        })
      );
  };

  getStopData = code => {
    let stopApiUrl =
      "httpss://transportapi.com/v3/uk/bus/stop/" +
      code +
      "/live.json?app_id=" +
      app_id +
      "&app_key=" +
      app_key;
    console.log(stopApiUrl);
    fetch(stopApiUrl)
      .then(stopData => stopData.json())
      .then(stopDataJson => this.modifyData(stopDataJson));
  };

  modifyData = data => {
    let updData = JSON.parse(JSON.stringify(data.departures));
    console.log(typeof updData);
    var result = Object.keys(updData).map(function(key) {
      return [Number(key), updData[key]];
    });
    this.setState({
      getStopData: true,
      departures: result
    });
  };

  render() {
    return (
      <div className="App">
        {this.state.error ? (
          <div>{this.state.errorMsg}</div>
        ) : (
          <div>
            {this.state.gotLocation ? (
              <div>
                <div>latitude: {this.state.latitude}</div>
                <div>longitude: {this.state.longitude}</div>
                {this.state.gotStops ? (
                  <div>
                    <div>Your Local Stops</div>

                    {this.state.busStops.map((stop, index) => (
                      <div key={index}>
                        {console.log(stop)}
                        <div onClick={() => this.getStopData(stop.atcocode)}>
                          {stop.name}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <div>
                {this.state.gettingLocation ? (
                  <div>Getting your location...</div>
                ) : (
                  <div>
                    <button onClick={() => this.getLocation()}>
                      Get Your Location
                    </button>
                    <button onClick={() => this.getLeedsBusTimes()}>
                      Get Leeds Location
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {this.state.getStopData ? (
          <div>
            Stop Data mode
            <div>
              {this.state.departures.map((item, index) => (
                <div>
                  {console.log(item)}
                  <div>{item[0]}</div>
                  <div>
                    {item[1].map((busItem, ind) => (
                      <div>
                        The Number {busItem.line} to {busItem.direction} leaves
                        at {busItem.expected_departure_time}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}

export default App;
