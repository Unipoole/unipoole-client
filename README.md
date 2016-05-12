[![Build Status](https://travis-ci.org/Unipoole/unipoole-client.svg?branch=master)](https://travis-ci.org/Unipoole/unipoole-client)
[![License](https://img.shields.io/badge/License-ECL%202.0-blue.svg)](https://opensource.org/licenses/ECL-2.0)

# unipoole-client
 This is the application that will run on the users/students PC. This project consist mainly of HTML/CSS and Javascript.

## Building
```bash
git clone https://github.com/Unipoole/unipoole-client.git
cd unipoole-client
mvn
```
Note: The build is executed using **only** the **mvn** command!

## Configuration
In the `public-html/unipoole/data/settings.json` file change the `sync_server` and `sync_port` settings to the values for the Unipoole-Service installation.


##Deployment
If the Maven build is successful there will be a target folder in the root of the project with 10 zip files. This archives can be uploaded to the Unipoole-Service.

Copy the zip files to a folder on the Unipoole-Service server, ex. `tomcat/temp/upload` folder.

Alter the `unipoole-service/src/test/curl/loadtools` file as follows:
* `BASE_URL` must point to local unipoole server
* `LOCATION` must point to the temp/upload folder
Run the file (after the Unipoole-Service has been started)