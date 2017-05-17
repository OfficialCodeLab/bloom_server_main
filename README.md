# Bloom API / Server


### Preamble

This is the main procuction server for the BLOOM wedding planner.

#### Notes:
- This app has been designed to respond easiest to queries from Ember.js,
but can be configured to work with any front-end framework or system.

- All HTTP requests are in the `./components/REST/*` folder.

- You will have to  `require()` new requests you create into the`./components/REST/driver.js` as imports.

-----

# Getting Started

### 1. Clone and install dependencies

    $ git clone https://github.com/OfficialCodeLab/bloom_server_main.git
    $ cd bloom_server_main
    $ npm install -g yarn
    $ yarn

### 2. Configure settings

Open up `settings.json` - you will find a few configurable options in there.

- `SERVER_PORT` - The IP port the server will bind to
- `CREATE_DIRECTORIES` - Boolean, if false, will not try to create a list of directories in the root folder.
- `DIRECTORIES` - An array of directories the server will create when run

### 3. Credentials Management

We do not store our sensitive information on git. Rather copy it from a local store. I recommend storing your credentials in ~/Credentials/Bloom/

    $ cp -r ~/Credentials/Bloom/. ./credentials/

### 4. Run!

    $ node index
