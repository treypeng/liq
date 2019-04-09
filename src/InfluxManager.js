
const Influx = require('influx');

const DAY_MS = 1000*60*60*24;

class InfluxManager
{
  constructor(config)
  {
    this.config = config;
    this.influx;
    this.prev = [];
    this.vdelta = {};
  }

  async init()
  {

    L.debug(`Writing to InfluxDB ${this.config.influx.database}:'${this.config.influx.measurement}'`);

    // This should throw an error if influx not running. But doens't. :thonking:
    this.influx = new Influx.InfluxDB({
     host: this.config.influx.host,
     port: this.config.influx.port,
     database: this.config.influx.database,
     schema: [
       {
         measurement: this.config.influx.measurement,
         fields: {
           price: Influx.FieldType.FLOAT,
           qty:   Influx.FieldType.INTEGER
         },
         tags: [
           'exchange',
           'instrument',
           'side',

         ]
       }
     ]
    });

    // lolwut? You have to create a database ... a-a-after opening it? excusemewtf
    // why isn't this a static method? feels hacky af, try harder API nerds.
    let names = await this.influx.getDatabaseNames();

    if (!names.includes(this.config.influx.database))
      this.influx.createDatabase(this.config.influx.database);

  }



  writeliq(frame)
  {
    let f = frame;
    let points = [];

    points.push({
      measurement: this.config.influx.measurement,
      tags: {
        exchange: 'bitmex',
        instrument: String(f.symbol),
        side: String(f.side)
      },
      fields: {
        price: f.price,
        qty: f.qty
      },
      timestamp: f.timestamp
    });


    this.influx.writePoints(points, { precision: 'ms' }).then(() => {
      L.debug('Inserted OK');
    }).catch(error => {
      console.log(error);
      L.error(`1 Error saving data to InfluxDB! Is the docker service running?`);
    });

    return 1;

  }

}

module.exports = InfluxManager;
