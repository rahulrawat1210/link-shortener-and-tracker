var country, region, city, timezone;
var deviceType = req.device.type;

var agent = useragent.parse(req.headers['user-agent']);
const IP = req.clientIp;
var os = agent.os.toString();

request.get({
    url: "http://ip-api.com/json",
    json: true,

}, (error, res, data) => {
    if (error) {
        console.log('Error:', error);
        res.json({
            success: false,
            err: 'Problem in Geo Location API!!!'
        });
    } else if (res.statusCode !== 200) {
        console.log('Status:', res.statusCode);
        res.json({
            success: false,
            err: 'No data Found for this IP!!!!'
        });
    } else {
        if (data.status == 'fail') {
            res.json({
                success: false,
                err: "Invalid IP " + data.query
            });
        } else {
            country = data.country;
            timezone = data.timezone;

            city = data.city;
            region = data.regionName;
            console.log(country, timezone, city, region);

        }
    }
});