const express = require("express");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const router = express.Router();

const UrlSchema = new Schema(
  {
    email: { type: String, default: null },
    hitCount: { type: Number, default: 0 },
    key: { type: String, index: true, required: true },
    link: { type: String, required: true },
  },
  { timestamps: true }
);

mongoose
  .connect("mongodb://localhost/shukshmaDB")
  .then(() => console.log("mongo connected"));

const Link = new mongoose.model("Link", UrlSchema);

router.get("/", async (req, res) => {
  try {
    const email = req.body.email;
    const links = await Link.find({ email: email });
    res.json({ links });
  } catch (error) {
    res.json({ msg: "error is there" });
  }
});

router.post("/", async (req, res) => {
  console.log(req.body);

  try {
    const key = req.body.key;
    const isDuplicateKey = await Link.findOne({ key: key });
    if (isDuplicateKey) {
      return res.json({
        msg: "duplicate key",
      });
    } else {
      const urlData = { ...req.body };
      const link = new Link(urlData);
      link.save().then(async (feedback) => {
        console.log(feedback);
        res.json({
          msg: "link created",
          object: feedback,
        });
      });
    }
  } catch (err) {
    res.json({ msg: "error is there" });
  }
});

router.delete("/", async (req, res) => {
  try {
    const { key } = req.body;
    const deleted = await Link.deleteOne({ key: key });
    res.json({ msg: "url deleted", data: deleted });
  } catch (error) {
    res.json({
      msg: "error is there",
    });
  }
});

router.put("/", async (req, res) => {
  try {
    const { key, newKey, email } = req.body;
    const updated = await Link.updateOne({ key }, { key: newKey });
    res.json({ msg: "url key updated", data: updated });
  } catch (error) {
    res.json({
      msg: "error is there",
    });
  }
});

router.get("/:key", async (req, res) => {
  try {
    const key = req.params.key;
    Link.findOneAndUpdate(
      { key: key },
      { $inc: { hitCount: 1 } },
      { new: true }
    ).then((res1) => {
      console.log(res1);
      const link = res1.link;
      res.redirect(link.startsWith("http") ? link : `https://${link}`);
    });
  } catch (error) {
    res.json({
      msg: "error is there",
    });
  }
});

module.exports = router;
