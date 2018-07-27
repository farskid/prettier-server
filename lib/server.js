const path = require('path');
const prettier = require('prettier');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const defaultOptions = require('./default-format-options');

function createServer(port) {
  const app = express();
  app.use(cors());
  app.use(bodyParser.json());
  app.set('port', port);
  app.listen(port, () => {
    console.log(`prettier-server started on port ${port}`);
  });
  setApiRoutes(app);
  return app;
}

function setHeadersOnResponse(res) {
  return json => {
    res.set('Content-Length', json.length);
    res.set('Accept-Ranges', 'bytes');
    res.set('Cache-Control', 'no-cache');
  };
}

function setApiRoutes(app) {
  // Serve view
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/index.html'));
  });

  // format endpoint
  app.post('/format', (req, res) => {
    // code block passed as request body
    const { code, options: onDemandOptions } = req.body;
    // merge two options together
    const options = {
      ...defaultOptions,
      ...onDemandOptions
    };

    console.log(options.semi);

    try {
      const result = prettier.format(code, options);

      setHeadersOnResponse(res)(result);

      return res.status(200).json({
        error: false,
        result
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error: true,
        message: 'Invalid code proto',
        formatError: err.toString()
      });
    }
  });
}

module.exports = () => createServer(3000);
