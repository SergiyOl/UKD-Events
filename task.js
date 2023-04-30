const nodemailer = require("nodemailer");
const EventEmitter = require("events");
const fs = require("fs");

let transporter = nodemailer.createTransport({ //Write your gmail data
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: "<Your email>", 
        pass: "<Your password>",
        clientId: "<ClientId>",
        clientSecret: "<ClientSecret>",
        refreshToken: "<refreshToken>"
      }
});

const eventEmitter = new EventEmitter();
eventEmitter.on("temperatureData", (date, temperature) => {
  const data = { date, temperature };
  fs.writeFile("data.json", JSON.stringify(data), (err) => {
    if (err) throw err;
    console.log("Data saved to file.");
  });
});
eventEmitter.on("averageTemperature", (date) => {
  fs.readFile("data.json", "utf8", (err, data) => {
    if (err) throw err;

    const parsedData = JSON.parse(data);
    const temperatures = parsedData
      .filter((entry) => entry.date === date)
      .map((entry) => entry.temperature);
    const average =
      temperatures.reduce((total, temp) => total + temp, 0) /
      temperatures.length;
      console.log(`Average temperature for ${date} is ${average}.`);

      let mailOptions = {  // Write email data
      from: "<Your email>",
      to: "<Send to>",
      subject: `Average temperature for ${date}`,
      text: `Average temperature for ${date} is ${average}`
      }
      console.log("Sending email")
      transporter.sendMail(mailOptions, function (err, data) {
          if (err) {
            console.log("Error " + err);
          } else {
            console.log("Email sent successfully");
          }
});
  });
});
eventEmitter.on("temperatureData", (date, temperature) => {
  if (temperature > 30) {
    eventEmitter.emit("highTemperature", date, temperature);
  }
});

eventEmitter.on("highTemperature", (date, temperature) => {
  console.log(
    `High temperature alert! On ${date}, temperature was ${temperature}`
  );
});
