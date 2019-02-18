# Gaia Nodes
Set of nodes for interfacing with the GAIA Platform (mostly Sparkworks API v.1).

[GAIA](https://www.gaia-project.eu) (Green Awareness In Action) is a three year long, EU-funded H2020 project made up of nine partners.
This project aims to promote positive behavioural changes within communities regarding energy consumption/awareness.
Our activities will consist of the gamification of real-time, IoT-enhanced energy consumption metrics in trial schools located in Italy, Greece and Sweden.

Access requires a valid Sparkworks account (see [Configuration](#Configuration))

## Installation
You can install gaianodes directly using the editor i.e. the web interface. To do this select Manage Palette from the menu (top right), and then select the install tab in the palette. You can now search for new nodes to install, just type *gaianode* and select **node-red-contrib-gaianode**. After a while the new nodes will appear in the left panel under the group *Gaia*.

Otherwise you can install gaianodes within your user data directory (by default, %HOME%/.node-red) by typing:
```
cd %HOME%/.node-red
npm install node-red-contrib-gaianode
```



---




## Available nodes
- **LatestValue**: retrieves the latest value (with some additional informaion) of the resource identified by the id given to the node
- **Summary**: retrieves the summary (latest value, averages, min, max, latest values at different granularities) of the resource identified by the id given to the node
- **RealTime**: connects to the websocket output of the Gaia Platform allowing to receive real time unprocessed data as injected into the platform by the sensors
- **Notifications**: connects to the websocket output of the Gaia Platform allowing to receive real time unprocessed data as injected into the platform by the sensors
- **ListResources**: list the resources (sensors) associated with the given site id
- **Timerange**: retrieve the values in the specified time window at the specified granularity (5min, hour, day, month) for the given resource
- **PushValue**: push a value into the Gaia Platform (a valid virtual sensor id is needed, see BMS manual for infromation)
- **Uri2Id**: convert the given URI to a numeric resource id to be used with other GaiaNodes



### LatestValue
<img src="https://raw.githubusercontent.com/buddino/node-red-contrib-gaianode/master/readme/images/nodes_latestvalue_a.JPG">

#### Parameters
- **Resource id**: numerid id or a mustache-style string (e.g. {{msg.payload}})
- **Gaia Server**: a configured Gaia Server

#### Output

- **payload**
  * **uri**: Literal identifier of the resource
  * **uom**: The Unit of measurement
  * **latestTime**: The Timestamp of the measurement in milliseconds (UNIX time)
  * **latest**: The latest value measured
  * **latestMin5**: The averaged value during the latest 5 minutes
  * **latestMin60**: The averaged value during the latest hour
  * **latestDay**: The averaged value during the latest day
  * **latestMonth**: The averaged value during the latest month 
- **topic**: The id of the queried resource



#### Details
The queried resource can be configured writing directly its id (e.g. *155076*) or by using mustache-style tags (e.g. *{{msg.payload.id}}* or *{{msg.payload.resource}}* for accessing the fields of the input message)

### Summary
Retrieves the summary for the given resource id from the GAIA Platform

#### Output
- **payload**
  * uri: Literal identifier of the resource
  * uom: The Unit of measurement
  * latestTime: The Timestamp of the measurement in milliseconds (UNIX time)
  * latest: The latest value measured
  * minutes5: Array containing the latest 48 values at 5 minutes interval
  * minutes60: Array containing the latest 48 values at one hour interval
  * day: Array containing the latest 48 values at one day interval
  * month: Array containing the latest 48 values at one month interval 
  * min: Minimum value of the latest (5 minutes, hour, day, month) 
  * max: Maximum value of the latest (5 minutes, hour, day, month)
  * max: Mean value of the latest (5 minutes, hour, day, month)
- **topic**: The id of the queried resource









### Timerange
Retrieves the values of the given resource within the specified time window.

#### Parameters
- **Resource id**: numerid id or a mustache-style string (e.g. {{msg.payload}})
- **From**: a date and time or a mustache-style string (e.g. {{msg.payload.from}}) in the format *2010/08/17 12:09:36*
- **To**: a date and time or a mustache-style string (e.g. {{msg.payload.to}}) in the format *2010/08/17 12:09:36*
- **Granularity**: the interval between queried values (5 minutes, 1 hour, 1 day, 1 month)
- **Gaia Server**: a configured Gaia Server

#### Output
- **payload** is a dictionary whose key are the ids of the requested resources *(currently only one resource at a time is supported)*
	* **average**: Average of the values in the time range
	* **summary**:  Sum of the values in the time range
	* **data**: Array of measurements. Each element contains:
		* **reading**: measurement value
		* **timestamp**: UNIX timestamp of the reading (milliseconds)
- **topic**: The id of the queried resource







### PushValue
Send a value to the specified resource (Virtual sensor) on the Gaia platform. Virtual sensors can be created using the Gaia [BMS application](http://bms.gaia-project.eu).

#### Parameters
- **Resource id**: numerid id or a mustache-style string (e.g. {{msg.payload}})
- **Gaia Server**: a configured Gaia Server

#### Creation of a virtual sensor
You can refer to the [BMS - User Guide](https://drive.google.com/file/d/0B7V8WLqD0OeNWXQ5c3hRdGhROTg/view) pages 14-15.
**Issue**
Currently the best way for retrieving the resource id of a Virtual Sensor is to open its page (by clicking on the sensor) and take the id from the URL shown in the browser (e.g. *http://bms.gaia-project.eu/#/page/sensor/view/**1000565** * )





### Uri2Id
This node converts the textual URI of a resource to a numeric resource id to be used into the other gaia nodes.

#### Parameters
- **Resource id**: textual URI or a mustache-style string (e.g. {{msg.payload.uri}})
- **Gaia Server**: a configured Gaia Server

#### Output
- **payload** contains the numeric id of the resource identified by the provided URI




### ListResource
Retrieves the list of available resources given a site identifier

#### Parameters
- **Site id**: numerid id or the site you want whose resources will be listed or a mustache-style string (e.g. {{msg.site}})
- **Gaia Server**: a configured Gaia Server

#### Output
- **payload** contains the numeric id of the resource identified by the provided URI
	- **resources**: An array of resources (sensors in this case) each one composed by:
		- **resourceId**: The numeric id of the resource
		- **uri**: The URI of the resource
		- **name**: The name of the resource
		- **isa**: the type of resource (e.g., sensor)
		- **property**: Measured property (e.g., Temperature, Luminosity)
		- **uom**: Unit of measurement (e.g., Wh, A, Raw)
- **options** An array of key-value couple. The key is the URI of the resource and the value id the numeric id. This is usefull for creating selection widgets (e.g., for letting hte user choose in the GUI the resource to be read)


### RealTime
**Experimental**
Connects to the GAIA platform to receive real time measurements as soon as they are pushed to the platform

#### Parameters
- **Path**: the path of the school/area to monitor (e.g. *ROOT.GAIA.GROUPS.155076* where **155076** is the site id of the school)
- **Gaia Server**: a configured Gaia Server

#### Output
The message received by the platform are forwarded in real-time without post processing (e.g. cleaning, aggregation):
- **payload**:
	- **timestamp**: The Timestamp of the measurement in milliseconds (UNIX time)
	- **resourceUri**: URI of the resource
	- **value**: Value read by the sensor

	
	
	
	
### Notifications
**Experimental**
Connects to the GAIA Recommendation engine and listen for real time notifications

#### Parameters
- **Site id**: numerid id or the site you want whose resources will be listed or a mustache-style string (e.g. {{msg.site}})
- **Gaia Server**: a configured Gaia Server

#### Output
- **payload**: the textual recommendation sent by the engine
- **notification** contains:
	- **timestamp**:  Timestamp of the event (UNIX time)
	- **school**: Identifier of the school the rule belongs to
	- **area**: Identifier of the area to which the rule is linked
	- **ruleClass**: Name of the class of the rule
	- **ruleName**: Name of the rule (the instance of the rule)
	- **ruleId**: Id of the rule
	- **values**: Object containing a snapshot of the values when the rule has been fired
	- **description**: Brief description of the rule
	- **suggestion**: Same content of payload
	- **type**: The type of message received (e.g., info, alert)





## Configuration
To use the Gaia Nodes we must create a Gaia Server (one server can be used by multiple nodes).
From the configuration of first Gaia node you insert you must chose one valid Gaia server, if don't have any configured click on the edit button

<img src="https://raw.githubusercontent.com/buddino/node-red-contrib-gaianode/master/readme/images/config_a.png" width="350">

The Gaia server configuration window will open and you have just to enter your credentials and press *Add*
From this moment you will find this server in the dropdown menu of each Gaia node.

<img src="https://raw.githubusercontent.com/buddino/node-red-contrib-gaianode/master/readme/images/config_b.png" width="350">





## Details
Paramters can be configured in the node configuration typing its id (e.g. *155076*) or, where specified, by using mustache-style tags (e.g. *{{msg.payload.id}}* or *{{msg.payload.resource}}* for accessing the fields of the input message). It is also possible to configure the timestamp associated with the value by using the *Time* field in the node configuration; you can use mustache-style tags for accessing the field of the message to be used as timestamp (e.g. {{msg.payload.timestamp}} ).

[Mustache](https://mustache.github.io/)

[Gaia API](https://api.sparkworks.net/swagger-ui.html#/)

[Gaia Android Application](https://play.google.com/store/apps/details?id=eu.gaiaproject.android.companion) Android >= 7.0

[Gaia Android Virtual Sensor](https://play.google.com/store/apps/details?id=com.ionicframework.gaia_euproject_psapplication) 