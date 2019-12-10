const express = require("express");
const bodyParser = require("body-parser");
const signature = require("./verifySignature");
const api = require("./api");
const axios = require("axios");

const app = express();

const rawBodyBuffer = (req, _, buf, encoding) => {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || "utf8");
  }
};

app.use(bodyParser.urlencoded({ verify: rawBodyBuffer, extended: true }));
app.use(bodyParser.json({ verify: rawBodyBuffer }));

const server = app.listen(process.env.PORT || 5000, () => {
  console.log(
    "Express server listening on port %d in %s mode",
    server.address().port,
    app.settings.env
  );
});

app.post("/selection", async (req, res) => {
  if (!signature.isVerified(req)) {
    res.sendStatus(404); // You may throw 401 or 403, but why not just giving 404 to malicious attackers ;-)
    return;
  } else {
    if (req.query && req.query.workflow) {
      const build = await api.postBuild(req.query.workflow);
      return res.json({
        response_type: "in_channel",
        text: `${build} for ${req.query.workflow} (Duration: ~15min)`
      });
    }

    const projects = await api.getFollowedProjects();
    return res.json({
      response_type: "in_channel",
      attachments: [
        {
          text: "Please select a Project",
          fallback: "You are unable to choose a project",
          callback_id: req.body.command,
          actions: [
            ...projects.map(project => ({
              name: "project",
              text: project.reponame,
              type: "button",
              value: project.reponame
            })),
            {
              name: "project",
              text: "Cancel",
              type: "button",
              value: "cancel",
              style: "danger"
            }
          ]
        }
      ]
    });
  }
});

app.post("/interaction", async (req, res) => {
  if (!signature.isVerified(req)) {
    res.sendStatus(404); // You may throw 401 or 403, but why not just giving 404 to malicious attackers ;-)
    return;
  } else {
    const payload = JSON.parse(req.body.payload);
    const value = payload.actions[0].value;

    if (value === "cancel") {
      return await axios
        .post(payload.response_url, {
          delete_original: "true"
        })
        .catch(error => {
          console.log(error);
        });
    }

    if (
      payload.callback_id === "/build" ||
      payload.callback_id === "/build-custom"
    ) {
      const build = await api.postBuild(value);
      return res.json({
        response_type: "in_channel",
        text: `${build} for ${value} (Duration: ~15min)`
      });
    }
  }
});
