import React from 'react';
import { compose, withProps } from "recompose"
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from "react-google-maps"

const MapComponent = compose(
  withProps({
    googleMapURL: "https://maps.googleapis.com/maps/api/js?v=3.exp&key=AIzaSyBPxHtY-9sp16UxrDDXAvto7ekK0XuiYmU&libraries=geometry,drawing,places",
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: `320px`, marginBottom: '24px' }} />,
    mapElement: <div style={{ height: `100%` }} />,
  }),
  withScriptjs,
  withGoogleMap
)((props) =>
  <GoogleMap
    defaultZoom={16}
    center={props.location}
  >
    {props.isMarkerShown && <Marker position={props.location} />}
  </GoogleMap>
);


export default MapComponent;
