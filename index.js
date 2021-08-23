var axios = require('axios');
var dayjs = require('dayjs');
var nodemailer = require('nodemailer');
var player = require('play-sound')(opts = {})

var centers = [];
var validCenters = [];

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: '',
        pass: '',
        clientId: "",
        clientSecret: "",
        refreshToken: ""
    }
});

function mailOptions() {
    return {
        from: 'neelbhakta@gmail.com',
        to: 'neelbhakta@gmail.com',
        subject: 'Check CoWin Portal Now',
        text: JSON.stringify(validCenters)
    }
};

function sendEmail() {
    transporter.sendMail(mailOptions(), function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

function playSound() {
    // { timeout: 300 } will be passed to child process
    player.play('./assets/alarm-sound2.wav', { timeout: 300 }, function (err) {
        if (err) throw err
    })
}


function callAPI() {
    validCenters = [];
    var date = dayjs().format('DD-MM-YYYY');
    var config = {
        method: 'get',
        url: `https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByDistrict?district_id=294&date=${date}`,
        headers: {
            'authority': 'cdn-api.co-vin.in',
            'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
            'accept': 'application/json, text/plain, */*',
            'sec-ch-ua-mobile': '?0',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
            'origin': 'https://selfregistration.cowin.gov.in',
            'sec-fetch-site': 'cross-site',
            'sec-fetch-mode': 'cors',
            'sec-fetch-dest': 'empty',
            'referer': 'https://selfregistration.cowin.gov.in/',
            'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8'
        }
    };

    axios(config)
        .then(function (response) {
            validCenters = [];
            centers = response.data.centers;
            centers.forEach(center => {
                if (center.sessions && center.sessions.length > 0) {
                    const sessions = center.sessions;
                    sessions.forEach(obj => {
                        if (obj['min_age_limit'] === 18 && obj['available_capacity'] > 1) {
                            validCenters.push({
                                name: center.name,
                                date: obj.date,
                                capacity: obj['available_capacity'],
                                pincode: center.pincode
                            });
                        }
                    })
                }
            })
            console.log(`Available Sessions ${validCenters.length} at ${dayjs().format('HH:mm:ss')}`)
            if (validCenters.length > 0) {
                console.log(`${validCenters[0].name} - ${validCenters[0].pincode}`)
                // sendEmail();
                playSound();
            }
        })
        .catch(function (error) {
            console.log(error);
            // playSound();
        });

}

function onStart() {
    setInterval(() => {
        callAPI();
    }, 2000)
}

onStart();

