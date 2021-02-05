const express = require("express");
const RouterGet = express.Router();
const mongoose = require("mongoose");
const DIR = "./public/";
const Visit = mongoose.model("Visit");
const VisitList = mongoose.model("VisitList");
const Patient = mongoose.model("Patient");
const User = mongoose.model("User");

// get data from frontend
RouterGet.post("/api/addVisit", async (req, res) => {
  console.log(req.body.json);
  let paths = [];
  // if (!req.files)
  //   return res.status(400).json({ error: "Invalid request, image required" });
  if (req.files) {
    console.log(req.files);
    const images = req.files.image;
    if (!Array.isArray(images)) {
      images = [images];
    }
    await images.forEach((image) => {
      let path =
        req.protocol + "://" + req.headers.host + "/public/" + image.name;
      newPath = DIR + image.name;
      paths.push(path);
      image.mv(newPath, (error) => {
        if (error) {
          console.error(error);
          res.writeHead(500, {
            "Content-Type": "application/json",
          });
          res.end(JSON.stringify({ status: "error", message: error }));
          return;
        }
      });
    });
    savePatient(req, paths);
  }
});
//check json
function isValidJsonString(jsonString) {
  if (!(jsonString && typeof jsonString === "string")) {
    return jsonString;
  }

  try {
    JSON.parse(jsonString);
    return JSON.parse(jsonString);
  } catch (error) {
    return jsonString;
  }
}

const savePatient = (req, paths) => {
  console.log("in patient");
  let data = isValidJsonString(req.body.json);
  if (!Array.isArray(data)) {
    data = [data];
  }
  let i = 0;
  data.modelPatientList.forEach((patient) => {
    Patient.find({ patientId: patient.patientId }).then((result) => {
      if (result.length > 0) {
        console.log("patient exists");
      } else {
        const patient = new Patient({
          user: data.appUserId,
          patientAddedDate: patient.patientAddedDate,
          patientAge: patient.patientAge,
          patientDob: patient.patientDob,
          patientFirstName: patient.patientFirstName,
          patientFullName: patient.patientFullName,
          patientGender: patient.patientGender,
          patientHouseno: patient.patientHouseno,
          patientId: patient.patientId,
          patientLastName: patient.patientLastName,
          patientMiddleName: patient.patientMiddleName,
          patientMunicipality: patient.patientMunicipality,
          patientPhone: patient.patientPhone,
          patientSpouseFullName: patient.patientSpouseFullName,
          patientVillagename: patient.patientVillagename,
          patientspousefirstname: patient.patientspousefirstname,
          patientspouselastname: patient.patientspouselastname,
          patientwardno: patient.patientwardno,
          image: paths[i],
        });
        patient
          .save()
          .then((result) => {
            console.log("success sith patient");
          })
          .then((err) => {
            console.log(err);
          });
      }
    });
    i++;

    patient.modelVisitList.forEach((visit) => {
      const visitList = new VisitList({
        visit,
        user_id: data.appUserId,
        patientId: patient.patientId,
      });
      visitList.save().then((result) => {
        console.log("success with visitlist");
      });
    });
  });
  data.modelPatientList.forEach((patient) => {
    Patient.find({ patientId: patient.patientId }).then((result) => {
      patient.image = result[0].image;
    });
  });

  const visit = new Visit({
    AppUserList: data,
    user: user_id,
    synced: false,
  });
  visit
    .save()
    .then((result) => {
      if (sendAll) {
        Visit.find({ user: data.appUserId }).then((result) => {
          res
            .status(200)
            .json({ code: "200", status: "Success", details: result });
        });
      } else {
        res.status(200).json({ code: "200", status: "Success", details: {} });
      }
    })
    .catch((err) => {
      console.log("first", err);
      res.status(500).json({ code: "500", status: "Failure", details: {} });
    });
};

RouterGet.post("/api/checkVisit", (req, response) => {
  console.log(req.body);
  const visit_id = req.body;
  if (visit_id.length > 0) {
    const user_id = visit_id[0].split("_")[0];
    console.log(user_id);

    if (Array.isArray(visit_id)) {
      let modelPatientList = [];
      visit_id.forEach((visit_id) => {
        VisitList.find({
          $and: [{ $ne: visit_id }, { user: user_id }],
        })
          .then((result) => {
            console.log(result);
            result.forEach((item) => {
              modelPatientList.push(item.patient);
            });
            console.log(modelPatientList);
            response.status(200).json({ appUserId: user_id, modelPatientList });
          })
          .catch((err) => {
            console.log(err);
          });
      });
    } else {
      Patient.find({
        $and: [
          { "patient.modelVisitList": { $elemMatch: { $ne: visit_id } } },
          { user: user_id },
        ],
      })
        .then((result) => {
          let modelPatientList = [];
          result.forEach((item) => {
            modelPatientList.push(item.patient);
          });
          response.status(200).json({ appUserId: user_id, modelPatientList });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  } else {
    const user_id = visit_id.split("_")[0];
    Patient.find({ user: user_id })
      .then((result) => {
        let modelPatientList = [];
        result.forEach((item) => {
          modelPatientList.push(item.patient);
        });
        response.status(200).json({ appUserId: user_id, modelPatientList });
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

module.exports = RouterGet;
