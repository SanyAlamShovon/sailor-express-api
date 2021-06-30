const unirest = require('unirest');


const sendSms = async (msg,phone) => {
    var req = unirest('POST', 'http://66.45.237.70/api.php?username=asraful9836&password=S9RF5CZ8&number='+phone+'&message='+msg)
            .headers({
            'Content-Type': 'application/x-www-form-urlencoded'
            })
            .send("")
            .end(function (res) { 
                if (res.error) throw new Error(res.error); 
                console.log(res.raw_body);
            });
}


module.exports = sendSms;