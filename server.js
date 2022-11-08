const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const multer = require("multer");
const axios = require("axios");
const cors = require("cors");

const app = express();
require("dotenv").config();

const port = process.env.PORT || 5001;
////
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

////
app.post("/startImgixSession", upload.single("pic"), async (req, res) => {
  const file = req.file;
  console.log("Starting imgix session in server.js");
  //console.log(file);
  console.log(".env is " + process.env.IMGIX_API);
  var config = {
    method: "post",
    url:
      `https://api.imgix.com/api/v1/sources/62e31fcb03d7afea23063596/upload-sessions/` +
      file.originalname,
    headers: {
      Authorization: "Bearer " + process.env.IMGIX_API,
      "Content-Type": file.mimetype,
    },
    data: req.file.buffer,
  };

  let final = await axios(config)
    .then(function (response) {
      console.log("successfully did /startImgixSession axios call");
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

app.post("/postSession", upload.single("pic"), async (req, res) => {
  let fileBufferData = req.file.buffer;
  let theAWSurl = req.body.awsURL;

  var config = {
    method: "put",
    url: theAWSurl,
    headers: {
      "Content-Type": "video/mp4",
    },
    data: fileBufferData,
  };

  let finalPost = await axios(config)
    .then(function (response) {
      console.log("inside the axios for /postSession");
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });

  return res.status(200).send(finalPost);
});

//Checks status of an imgix session.
app.post("/checkImgixSessionStatus", async (req, res) => {
  console.log("Checking imgix status in /checkImgixSessionStatus");
  const gssid = req.body.grabbedSessionSourceID;

  var config = {
    method: "get",
    url:
      `https://api.imgix.com/api/v1/sources/62e31fcb03d7afea23063596/upload-sessions/` +
      gssid,
    headers: {
      Authorization: "Bearer " + process.env.IMGIX_API,
      "Content-Type": "application/json",
    },
  };

  let final = await axios(config)
    .then(function (response) {
      console.log("INSIDE THE .then() FOR /checkImgixSessionStatus");
      //console.log(JSON.stringify(response.data));
      return response.data;
    })
    .catch(function (error) {
      console.log(error);
      return error;
    });
  return res.status(200).send(final);
});

//Close a session
app.post("/checkImgixCloseSession", async (req, res) => {
  console.log("Checking imgix status in /checkImgixCloseSession");
  const gssid = req.body.grabbedSessionSourceID;

  var config = {
    method: "post",
    url:
      `https://api.imgix.com/api/v1/sources/62e31fcb03d7afea23063596/upload-sessions/` +
      gssid,
    headers: {
      Authorization: "Bearer " + process.env.IMGIX_API,
    },
  };

  let final = await axios(config)
    .then(function (response) {
      console.log("INSIDE THE .then() FOR /checkImgixCloseSession");
      console.log(JSON.stringify(response.data));
      return response.data;
    })
    .catch(function (error) {
      console.log(error);
      return error;
    });
  return res.status(200).send(final);
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
