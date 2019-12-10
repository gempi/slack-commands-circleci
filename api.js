const axios = require("axios");

const version = process.env.CIRCLECI_API_VERSION;
const org = process.env.CIRCLECI_ORG;
const apiKey = process.env.CIRCLECI_API_KEY;

const postBuild = async repo => {
  const url = `https://circleci.com/api/v${version}/project/github/${org}/${repo}/build?circle-token=${apiKey}`;
  const results = await axios
    .post(url)
    .then(response => {
      return response;
    })
    .catch(error => {
      console.log(error);
    });

  return results.data.body;
};

const getRecentBuild = async repo => {
  const url = `https://circleci.com/api/v${version}/project/github/${org}/${repo}?circle-token=${apiKey}&limit=1&shallow=true`;
  const results = await axios
    .get(url)
    .then(response => {
      return response;
    })
    .catch(error => {
      console.log(error);
    });

  return results.data;
};

const getFollowedProjects = async () => {
  const url = `https://circleci.com/api/v${version}/projects?circle-token=${apiKey}`;
  const results = await axios
    .get(url)
    .then(response => {
      return response;
    })
    .catch(error => {
      console.log(error);
    });

  return results.data;
};

module.exports = { postBuild, getRecentBuild, getFollowedProjects };
