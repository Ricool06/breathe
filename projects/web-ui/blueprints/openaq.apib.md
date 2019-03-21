FORMAT: 1A

# OpenAQ

OpenAQ is the Open Air Quality API.

# Group Measurements

Resources related to measurements.

## Latest Measurement Collection [/latest]
### List All Latest Measurements [GET]

Lists the latest measurements

+ Parameters

    + limit: `1` (number, optional) - The max number of measurements to return.
      + Default: `100`
    + has_geo: `true` (boolean, optional) - If true, returns only measurements with location info.
      + Default: `false`
    + coordinates: `39.2133,117.1837` (string, optional) - Center point used to get measurements within a certain area.
    + radius: `2500` (number, optional) - Radius (in meters) used to get measurements within a certain area, must be used with coordinates.
      + Default: 2500

+ Response 200 (application/json)

      {
        "meta": {
          "name": "openaq-api",
          "license": "CC BY 4.0",
          "website": "https://docs.openaq.org/",
          "page": 1,
          "limit": 1,
          "found": 10306
        },
        "results": [
          {
            "location": " 淮河道",
            "city": "天津市",
            "country": "CN",
            "distance": 6485815.090163712,
            "measurements": [
              {
                "parameter": "pm10",
                "value": 39,
                "lastUpdated": "2019-02-25T19:00:00.000Z",
                "unit": "µg/m³",
                "sourceName": "ChinaAQIData",
                "averagingPeriod": {
                  "value": 1,
                  "unit": "hours"
                }
              },
              {
                "parameter": "o3",
                "value": 67,
                "lastUpdated": "2019-02-25T19:00:00.000Z",
                "unit": "µg/m³",
                "sourceName": "ChinaAQIData",
                "averagingPeriod": {
                  "value": 1,
                  "unit": "hours"
                }
              }
            ],
            "coordinates": {
              "latitude": 39.2133,
              "longitude": 117.1837
            }
          }
        ]
      }

## Measurement Collection [/measurements]
### List Any Measurements [GET]

Lists all measurements matching the criteria in the parameters

+ Parameters

    + page: `1` (number) - The page of results to return
    + limit: `1` (number, optional) - The max number of measurements to return.
      + Default: `100`
    + has_geo: `true` (boolean, optional) - If true, returns only measurements with location info.
      + Default: `false`
    + coordinates: `39.2133,117.1837` (string, optional) - Center point used to get measurements within a certain area.
    + radius: `100` (number, optional) - Radius (in meters) used to get measurements within a certain area, must be used with coordinates.
      + Default: 2500
    + date_from: `2019-03-20T21:00:00` (string, optional) - Show results after a certain date. This acts on the utc timestamp of each measurement.
    + date_to: `2019-01-21T22:00:00` (string, optional) - Show results before a certain date. This acts on the utc timestamp of each measurement.

+ Response 200 (application/json)

      {
        "meta": {
          "name": "openaq-api",
          "license": "CC BY 4.0",
          "website": "https://docs.openaq.org/",
          "page": 1,
          "limit": 10000,
          "found": 888
        },
        "results": [
          {
            "location": " 淮河道",
            "city": "天津市",
            "country": "CN",
            "parameter": "o3",
            "date": {
              "utc": "2019-03-20T21:00:00.000Z",
              "local": "2019-03-20T21:00:00+00:00"
            },
            "value": 51,
            "unit": "µg/m³",
            "coordinates": {
              "latitude": 39.2133,
              "longitude": 117.1837
            }
          }
        ]
      }
