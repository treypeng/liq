

module.exports = {

  influx: {
    host:           '192.168.1.33', // Need to use host ip with influx docker also with chronograf web interface
    port:           8086,           // Default influx port. Intel x86 nod?
    measurement:    'liq',
    database:       'alphaliq'   // db created automatically if not found
  },

  loglevel: 'info'               // 'error', 'warn', 'info', 'debug' (verbose)

};
