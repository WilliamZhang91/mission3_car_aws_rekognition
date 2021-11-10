const AWS = require("aws-sdk");
const express = require("express");
const fileUpload = require("express-fileupload");
const app = express();
require("dotenv").config();
app.use(fileUpload());

AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: "ap-southeast-2",
})

var rekognition = new AWS.Rekognition();

const identifyCar = (image) => {
    var params = {
        Image: {
            Bytes: image.data.buffer
        },
        MinConfidence: 70,
        ProjectVersionArn: process.env.PROJECT_VERSION_ARN,
    }
    rekognition.detectCustomLabels(params, function (err, data) {
        if (err) {
            console.log(err, err.stack)
        } else {
            console.log(data)
            //console.log(data.CustomLabels[0].Name)
            //console.log(data.CustomLabels[0].Confidence)
        }
    })
}

app.use(express.static("public")) //replaces app.get

app.post('/upload', function (req, res) {

    const uploadedImage = req.files.carPhoto;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    } else {
        identifyCar(uploadedImage, function (data) {
            const name = data.CustomLabels[0].Name
            const confidence = data.CustomLabels[0].Confidence
            return (`<p>${name}, ${confidence}</p>`)
        })
    }
    res.redirect('/')
});

app.listen(5000)


