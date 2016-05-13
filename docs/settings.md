# Settings
Settings are at `unipoole/data/settings.json`.

|property            |default                              |description |
|--------------------|-------------------------------------|-------------|
|sync_server         | unipoole.opencollab.co.za           | url of sync server to connect to - the unipoole-service server|
|sync_port           | 8081                                | port of unipoole server|
|dns_check_online    | www.google.com                      | must be changed to the unipoole server|
|syncCheckTimeout     | 2                                   | minutes in between when sync will be run on Sync Now click
|http_request_timeout | 15000                               | miliseconds before calls to the unipoole service will timeout - can be set higher
|onlineCheckFrequency | 1300                                | miliseconds in between the dns check to see if tool is online
|allowCodeSync        | false                               | This allows tool code synchronization to take place. Set to false for dev to avoid code being overwriten |
|maxSize              | 3072                                | log file size|
|maxFiles             | 5                                   | max log files|
|filePath             | ../../unipoole/server/logs/logs.txt | log file path|
|logToConsole         | true                                | log to node console|
