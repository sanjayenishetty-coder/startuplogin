// Site configuration — edit these values.
window.SL_CONFIG = {
  // Optional: endpoint that receives "Submit a startup" POSTs as JSON.
  // Works out of the box with Formspree/Getform/Basin-style form services,
  // e.g. "https://formspree.io/f/XXXXXXX". Leave empty to store submissions
  // in the visitor's browser (localStorage) with an on-screen note.
  formEndpoint: "",

  // SHA-256 hash of the review-console passcode (see README to change it).
  // This is a light gate for convenience, not real authentication — the
  // console holds no secrets and publishing always requires a git commit.
  adminPassHash: "80d3699b5e4b9e22f6265d158d22e556843d417b7b66dcaa8ddc3b0929c93e6b",

  // Map tiles (Carto Positron: free with attribution, cool light-grey style).
  tileUrl: "https://{s}.basemaps.cartocdn.com/rastertiles/light_nolabels/{z}/{x}/{y}{r}.png",
  tileAttribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
};
