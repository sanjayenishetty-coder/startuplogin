// Site configuration — edit these values.
window.SL_CONFIG = {
  // Optional: endpoint that receives "Submit a startup" POSTs as JSON.
  // Works out of the box with Formspree/Getform/Basin-style form services,
  // e.g. "https://formspree.io/f/XXXXXXX". Leave empty to store submissions
  // in the visitor's browser (localStorage) with an on-screen note.
  formEndpoint: "",

  // Map tiles (Carto Voyager: free with attribution, warm cream style).
  tileUrl: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png",
  tileLabelsUrl: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png",
  tileAttribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
};
