const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const multer = require("multer");
const axios = require("axios");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5001;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const memoStorage = multer.memoryStorage();
const upload = multer({ memoStorage });

//Uploading a file to imgix.
app.post("/uploadToImgix", upload.single("pic"), async (req, res) => {
  const file = req.file;
  console.log("/uploadToImgix in server.js");

  var config = {
    method: "post",
    url:
      `https://api.imgix.com/api/v1/sources/upload/62e31fcb03d7afea23063596/` +
      file.originalname,
    headers: {
      Authorization: "Bearer " + process.env.IMGIX_API,
      "Content-Type": file.mimetype,
    },
    data: req.file.buffer,
  };

  let final = await axios(config)
    .then(function (response) {
      console.log("successful call from /uploadToImgix in server.js");
      return response.data;
    })
    .catch(function (error) {
      console.log(error);
      return error;
    });

  let trueFinal = {
    allData: final,
    theBufferReturned: req.file.buffer,
  };
  return res.status(200).send(trueFinal);
});

//Get sensitive data status:
app.post("/imgixSensitiveData", async (req, res) => {
  console.log("Checking imgix status in /checkImgixSessionStatus");
  const nameOfImage = req.body.theValue;
  console.log(nameOfImage);

  var config = {
    method: "get",
    url:
      `https://api.imgix.com/api/v1/assets/62e31fcb03d7afea23063596` +
      nameOfImage,
    headers: {
      Authorization: "Bearer " + process.env.IMGIX_API,
      "Content-Type": "application/json",
    },
  };

  let result = await axios(config)
    .then(function (response) {
      //console.log("Ran /imgixSensitiveData in server.js");
      console.log(JSON.stringify(response.data.data.attributes.warning_adult));
      return response.data.data.attributes.warning_adult;
    })
    .catch(function (error) {
      console.log(error);
      return error;
    });
  let number = result.toString();
  return res.status(200).send(number);
});

if (process.env.NODE_ENV === "production") {
  // Serve any static files
  app.use(express.static(path.join(__dirname, "client/build")));

  // Handle React routing, return all requests to React app
  app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
  });
}

app.listen(port, () => console.log(`Listening on port ${port}`));
