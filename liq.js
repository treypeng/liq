

// const keypress      = require('keypress');
// const fetch         = require('node-fetch');
                      require('./src/util');
const MexLive       = require('./src/MexLive');
const InfluxManager = require('./src/InfluxManager');
const config        = require('./conf/config');

L.info( `Connecting to Influx ${config.influx.host}:${config.influx.port}` );

// Open create database ready for writing
const influxman = new InfluxManager( config );
let timer = null;
let totalliqs = 0;


let mexlive = new MexLive();

mexlive.on('connected', d => {
  L.info(`${d.info} [Throttler = ${d.limit}]\n` );
});


// setInterval(() => {
//
//   let frame = {
//     timestamp: Date.now(),
//     symbol: 'XBTUSD',
//     side: 'sell',
//     price: 5001,
//     qty: 123456
//   };
//
//   try {  num =  influxman.writeliq( frame ) } catch ( error ) {
//     L.error( `3 Error writing to Influx. Is the docker service running?` );
//     L.error(error);
//   }
//
//
//   totalliqs++;
//
//   console.log(`Liquidations=${totalliqs}`);
//
// }, 1000)
mexlive.on('liquidation', d => {

  if (d.status) return;
  if (!d.data.side) return;

  let frame = {
    timestamp: Date.now(),
    symbol: d.data.symbol,
    side: d.data.side.toLowerCase(),
    price: d.data.price,
    qty: d.data.leavesQty
  };

  try {  num =  influxman.writeliq( frame ) } catch ( error ) {
    L.error( `3 Error writing to Influx. Is the docker service running?` );
    L.error(error);
  }


  totalliqs++;

  console.log(`Liquidations=${totalliqs}`);


});

(async function() {

  await influxman.init();

  mexlive.connect('wss://www.bitmex.com/realtime');
  mexlive.subscribe('liquidation');

})();
