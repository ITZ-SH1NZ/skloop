global.window = { addEventListener: () => {}, innerWidth: 1000, innerHeight: 1000, devicePixelRatio: 1 };
global.document = { createElement: () => ({ style: {}, getContext: () => ({}) }) };
const THREE = require('three');
const vanta = require('vanta/dist/vanta.birds.min').default;
try {
  vanta({ el: { clientWidth: 100, clientHeight: 100, appendChild:()=>{} }, THREE });
  console.log("Success");
} catch(e) {
  console.log("Error:", e.message);
}
